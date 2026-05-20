'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { socialAccounts } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'
import { platformsSchema, PLATFORM_URL } from '@/lib/validators/platforms'
import { syncSocialAccount, type SyncResult } from '@/lib/external/sync'

export type PlatformsActionResult =
  | { ok: true; synced: SyncResult[] }
  | { ok: false; errors: Partial<Record<string, string[]>> }

export async function savePlatforms(data: unknown): Promise<PlatformsActionResult> {
  const parsed = platformsSchema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  await db.delete(socialAccounts).where(eq(socialAccounts.creatorId, creator.id))

  const entries = (Object.entries(parsed.data) as [string, string][]).filter(([, h]) => h.trim())

  let synced: SyncResult[] = []

  if (entries.length > 0) {
    await db.insert(socialAccounts).values(
      entries.map(([platform, handle]) => ({
        creatorId: creator.id,
        platform: platform as typeof socialAccounts.$inferInsert['platform'],
        handle: handle.trim(),
        url: (PLATFORM_URL[platform] ?? ((v: string) => v))(handle.trim()),
        followers: 0,
      }))
    )

    // Sync YouTube and Twitch to pull real follower counts into the DB
    const allNew = await db
      .select({ id: socialAccounts.id, platform: socialAccounts.platform })
      .from(socialAccounts)
      .where(eq(socialAccounts.creatorId, creator.id))

    const syncable = allNew.filter(
      (a) => a.platform === 'youtube' || a.platform === 'twitch'
    )

    if (syncable.length > 0) {
      const results = await Promise.allSettled(syncable.map((a) => syncSocialAccount(a.id)))
      synced = results
        .map((r) => (r.status === 'fulfilled' ? r.value : null))
        .filter((r): r is SyncResult => r !== null)
    }
  }

  revalidatePath(`/c/${creator.slug}`)
  revalidatePath('/dashboard/platforms')
  return { ok: true, synced }
}
