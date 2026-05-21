'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { creatorProfiles, socialAccounts } from '@/db/schema'
import { syncSocialAccount } from '@/lib/external/sync'

export async function resyncCreator(creatorId: number): Promise<{
  ok: boolean
  results: Array<{ platform: string; ok: boolean; followers: number; error?: string }>
}> {
  const accounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.creatorId, creatorId))

  const results = []
  for (const acct of accounts) {
    if (acct.platform !== 'youtube' && acct.platform !== 'twitch') continue
    const result = await syncSocialAccount(acct.id)
    results.push(result)
    await new Promise((r) => setTimeout(r, 250))
  }

  revalidatePath('/admin/creators')
  return { ok: true, results }
}

export async function setPublished(
  creatorId: number,
  published: boolean
): Promise<{ ok: boolean }> {
  await db
    .update(creatorProfiles)
    .set({ published, updatedAt: new Date() })
    .where(eq(creatorProfiles.id, creatorId))

  revalidatePath('/admin/creators')
  revalidatePath(`/c/[slug]`, 'page')
  return { ok: true }
}

export async function deleteCreator(creatorId: number): Promise<{ ok: boolean }> {
  await db.delete(creatorProfiles).where(eq(creatorProfiles.id, creatorId))
  revalidatePath('/admin/creators')
  return { ok: true }
}
