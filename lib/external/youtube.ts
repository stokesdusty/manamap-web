import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { platformCache } from '@/db/schema'

export interface YouTubeChannel {
  channelId: string
  title: string
  subscriberCount: number
  thumbnailUrl: string
  uploadsPlaylistId: string
}

export interface YouTubeVideo {
  videoId: string
  title: string
  thumbnailUrl: string
  publishedAt: string
  url: string
}

const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3'
const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

// ── Internal API response shapes ──────────────────────────────────────────────

interface YTChannelItem {
  id: string
  snippet: { title: string; thumbnails: { default: { url: string } } }
  statistics: { subscriberCount?: string }
  contentDetails: { relatedPlaylists: { uploads: string } }
}
interface YTChannelResponse { items?: YTChannelItem[] }

interface YTPlaylistItem {
  snippet: {
    resourceId: { videoId: string }
    title: string
    thumbnails?: { medium?: { url: string }; default?: { url: string } }
    publishedAt: string
  }
}
interface YTPlaylistResponse { items?: YTPlaylistItem[] }

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function readCache(handle: string, payloadKind: string) {
  const now = new Date()
  const [row] = await db
    .select({ payload: platformCache.payload, error: platformCache.error })
    .from(platformCache)
    .where(
      and(
        eq(platformCache.platform, 'youtube'),
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
      platform: 'youtube',
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

export async function fetchChannel(handle: string): Promise<YouTubeChannel | null> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return null

  const cached = await readCache(handle, 'channel')
  if (cached) return cached.error ? null : (cached.payload as YouTubeChannel)

  try {
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`
    const res = await fetch(
      `${YOUTUBE_BASE}/channels?part=snippet,statistics,contentDetails&forHandle=${encodeURIComponent(cleanHandle)}&key=${key}`
    )
    if (!res.ok) throw new Error(`YouTube API ${res.status}`)
    const json = (await res.json()) as YTChannelResponse
    const item = json.items?.[0]
    if (!item) {
      await writeCache(handle, 'channel', {}, new Date(Date.now() + ONE_HOUR_MS), 'Channel not found')
      return null
    }
    const data: YouTubeChannel = {
      channelId: item.id,
      title: item.snippet.title,
      subscriberCount: parseInt(item.statistics.subscriberCount ?? '0', 10),
      thumbnailUrl: item.snippet.thumbnails.default.url,
      uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
    }
    await writeCache(handle, 'channel', data, new Date(Date.now() + SIX_HOURS_MS), null)
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await writeCache(handle, 'channel', {}, new Date(Date.now() + ONE_HOUR_MS), msg)
    return null
  }
}

// Accepts the UC-prefixed channelId returned by fetchChannel.
// Derives the uploads playlist ID (UC → UU) without an extra API call.
export async function fetchLatestVideos(channelId: string, n = 6): Promise<YouTubeVideo[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return []

  const cached = await readCache(channelId, 'videos')
  if (cached) return cached.error ? [] : (cached.payload as YouTubeVideo[])

  const uploadsPlaylistId = channelId.replace(/^UC/, 'UU')

  try {
    const res = await fetch(
      `${YOUTUBE_BASE}/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=${n}&key=${key}`
    )
    if (!res.ok) throw new Error(`YouTube API ${res.status}`)
    const json = (await res.json()) as YTPlaylistResponse
    const videos: YouTubeVideo[] = (json.items ?? []).map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnailUrl:
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url ??
        '',
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    }))
    await writeCache(channelId, 'videos', videos, new Date(Date.now() + SIX_HOURS_MS), null)
    return videos
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await writeCache(channelId, 'videos', [], new Date(Date.now() + ONE_HOUR_MS), msg)
    return []
  }
}
