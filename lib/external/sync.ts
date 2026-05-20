import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles, socialAccounts } from '@/db/schema'
import { fetchChannel as fetchYouTubeChannel } from './youtube'
import { fetchChannel as fetchTwitchChannel } from './twitch'

export interface SyncResult {
  ok: boolean
  platform: string
  followers: number
  error?: string
}

export async function syncSocialAccount(socialAccountId: number): Promise<SyncResult> {
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.id, socialAccountId))
    .limit(1)

  if (!account) return { ok: false, platform: 'unknown', followers: 0, error: 'Account not found' }

  // Only YouTube and Twitch have API integrations; others stay at their current count.
  if (account.platform !== 'youtube' && account.platform !== 'twitch') {
    return { ok: true, platform: account.platform, followers: account.followers }
  }

  let followers = 0
  let error: string | undefined

  if (account.platform === 'youtube') {
    const channel = await fetchYouTubeChannel(account.handle)
    if (channel) {
      followers = channel.subscriberCount
    } else {
      error = "Couldn't reach YouTube"
    }
  } else {
    const channel = await fetchTwitchChannel(account.handle)
    if (channel) {
      followers = channel.followerCount
    } else {
      error = "Couldn't reach Twitch"
    }
  }

  const now = new Date()

  await db
    .update(socialAccounts)
    .set({
      followers,
      syncedAt: now,
      lastSyncError: error ?? null,
      lastSyncErrorAt: error ? now : null,
      updatedAt: now,
    })
    .where(eq(socialAccounts.id, socialAccountId))

  // Recompute followersTotal from all linked accounts for this creator
  const allAccounts = await db
    .select({ followers: socialAccounts.followers })
    .from(socialAccounts)
    .where(eq(socialAccounts.creatorId, account.creatorId))

  const followersTotal = allAccounts.reduce((acc, a) => acc + (a.followers ?? 0), 0)

  await db
    .update(creatorProfiles)
    .set({ followersTotal, updatedAt: now })
    .where(eq(creatorProfiles.id, account.creatorId))

  return error
    ? { ok: false, platform: account.platform, followers, error }
    : { ok: true, platform: account.platform, followers }
}
