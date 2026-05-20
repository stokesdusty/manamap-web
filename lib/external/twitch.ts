import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { platformCache } from '@/db/schema'

export interface TwitchChannel {
  broadcasterId: string
  displayName: string
  profileImageUrl: string
  // Follower count requires user OAuth scope; app-auth returns 0.
  followerCount: number
}

export interface TwitchLiveStatus {
  isLive: boolean
  title: string
  game: string
  viewerCount: number
}

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const TWITCH_API_BASE = 'https://api.twitch.tv/helix'
const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000
const SIXTY_SECONDS_MS = 60 * 1000

// ── Internal API response shapes ──────────────────────────────────────────────

interface TwitchTokenResponse { access_token: string; expires_in: number }
interface TwitchUserItem { id: string; login: string; display_name: string; profile_image_url: string }
interface TwitchUsersResponse { data?: TwitchUserItem[] }
interface TwitchStreamItem { type: string; title: string; game_name: string; viewer_count: number }
interface TwitchStreamsResponse { data?: TwitchStreamItem[] }

// ── App-access token (module-level, re-fetched on cold start) ─────────────────

let _token: { value: string; expiresAt: number } | null = null

async function getAppToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Twitch credentials not configured')

  if (_token && Date.now() < _token.expiresAt) return _token.value

  const res = await fetch(TWITCH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })
  if (!res.ok) throw new Error(`Twitch token ${res.status}`)
  const json = (await res.json()) as TwitchTokenResponse
  // Subtract 60s buffer so we refresh before actual expiry
  _token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 - 60_000 }
  return _token.value
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Client-Id': process.env.TWITCH_CLIENT_ID!,
  }
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function readCache(handle: string, payloadKind: string) {
  const now = new Date()
  const [row] = await db
    .select({ payload: platformCache.payload, error: platformCache.error })
    .from(platformCache)
    .where(
      and(
        eq(platformCache.platform, 'twitch'),
        eq(platformCache.handle, handle),
        eq(platformCache.payloadKind, payloadKind),
        gt(platformCache.expiresAt, now),
      )
    )
    .limit(1)
  return row ?? null
}

async function writeCache(
  handle: string,
  payloadKind: string,
  payload: unknown,
  expiresAt: Date,
  error: string | null,
) {
  const now = new Date()
  await db
    .insert(platformCache)
    .values({
      platform: 'twitch',
      handle,
      payloadKind,
      payload: payload as Record<string, unknown>,
      fetchedAt: now,
      expiresAt,
      error,
    })
    .onConflictDoUpdate({
      target: [platformCache.platform, platformCache.handle, platformCache.payloadKind],
      set: { payload: payload as Record<string, unknown>, fetchedAt: now, expiresAt, error },
    })
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchChannel(handle: string): Promise<TwitchChannel | null> {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) return null

  const cached = await readCache(handle, 'channel')
  if (cached) return cached.error ? null : (cached.payload as TwitchChannel)

  try {
    const token = await getAppToken()
    const login = handle.startsWith('@') ? handle.slice(1) : handle
    const res = await fetch(`${TWITCH_API_BASE}/users?login=${encodeURIComponent(login)}`, {
      headers: authHeaders(token),
    })
    if (!res.ok) throw new Error(`Twitch users ${res.status}`)
    const json = (await res.json()) as TwitchUsersResponse
    const user = json.data?.[0]
    if (!user) {
      await writeCache(handle, 'channel', {}, new Date(Date.now() + ONE_HOUR_MS), 'User not found')
      return null
    }
    const data: TwitchChannel = {
      broadcasterId: user.id,
      displayName: user.display_name,
      profileImageUrl: user.profile_image_url,
      followerCount: 0,
    }
    await writeCache(handle, 'channel', data, new Date(Date.now() + SIX_HOURS_MS), null)
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await writeCache(handle, 'channel', {}, new Date(Date.now() + ONE_HOUR_MS), msg)
    return null
  }
}

// Keyed by broadcasterId (not handle) so 60s TTL refreshes accurately.
export async function fetchLiveStatus(broadcasterId: string): Promise<TwitchLiveStatus | null> {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) return null

  const cached = await readCache(broadcasterId, 'live')
  if (cached) return cached.error ? null : (cached.payload as TwitchLiveStatus)

  try {
    const token = await getAppToken()
    const res = await fetch(
      `${TWITCH_API_BASE}/streams?user_id=${encodeURIComponent(broadcasterId)}`,
      { headers: authHeaders(token) }
    )
    if (!res.ok) throw new Error(`Twitch streams ${res.status}`)
    const json = (await res.json()) as TwitchStreamsResponse
    const stream = json.data?.[0]
    const data: TwitchLiveStatus =
      stream?.type === 'live'
        ? { isLive: true, title: stream.title, game: stream.game_name, viewerCount: stream.viewer_count }
        : { isLive: false, title: '', game: '', viewerCount: 0 }
    await writeCache(broadcasterId, 'live', data, new Date(Date.now() + SIXTY_SECONDS_MS), null)
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await writeCache(broadcasterId, 'live', {}, new Date(Date.now() + SIXTY_SECONDS_MS), msg)
    return null
  }
}
