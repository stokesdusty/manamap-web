'use server'

import { and, inArray, isNull, lt, or } from 'drizzle-orm'
import { db } from '@/db'
import { socialAccounts, creatorProfiles } from '@/db/schema'
import { syncSocialAccount } from '@/lib/external/sync'

export type ResyncResult = {
  totalQueued: number
  results: Array<{
    slug: string
    platform: string
    handle: string
    ok: boolean
    followers: number
    error?: string
  }>
}

export async function bulkResync(
  _prev: ResyncResult | null,
  _formData: FormData
): Promise<ResyncResult> {
  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const staleAccounts = await db
    .select({
      id: socialAccounts.id,
      platform: socialAccounts.platform,
      handle: socialAccounts.handle,
      creatorId: socialAccounts.creatorId,
    })
    .from(socialAccounts)
    .where(
      and(
        inArray(socialAccounts.platform, ['youtube', 'twitch']),
        or(
          isNull(socialAccounts.syncedAt),
          lt(socialAccounts.syncedAt, staleThreshold)
        )
      )
    )

  if (staleAccounts.length === 0) {
    return { totalQueued: 0, results: [] }
  }

  // Fetch slugs for the creators in one query
  const creatorIds = [...new Set(staleAccounts.map((a) => a.creatorId))]
  const creatorRows = await db
    .select({ id: creatorProfiles.id, slug: creatorProfiles.slug })
    .from(creatorProfiles)

  const slugById = Object.fromEntries(creatorRows.map((c) => [c.id, c.slug]))

  const results: ResyncResult['results'] = []

  for (const acct of staleAccounts) {
    const syncResult = await syncSocialAccount(acct.id)
    results.push({
      slug: slugById[acct.creatorId] ?? String(acct.creatorId),
      platform: acct.platform,
      handle: acct.handle,
      ok: syncResult.ok,
      followers: syncResult.followers,
      error: syncResult.error,
    })
    await new Promise((r) => setTimeout(r, 250))
  }

  return { totalQueued: staleAccounts.length, results }
}
