import { and, asc, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles, events, formatTags } from '@/db/schema'

// ── Featured creators ─────────────────────────────────────────────────────────

export async function getFeaturedCreators() {
  return db.query.creatorProfiles.findMany({
    where: eq(creatorProfiles.isFeatured, true),
    with: {
      region: { columns: { name: true } },
      primaryFormat: { columns: { name: true, colors: true } },
      contentTags: { with: { tag: { columns: { label: true } } } },
      socialAccounts: {
        columns: { platform: true, followers: true },
        orderBy: (s, { desc }) => [desc(s.followers)],
      },
    },
    orderBy: [desc(creatorProfiles.followersTotal)],
    limit: 3,
  })
}

export type FeaturedCreator = Awaited<ReturnType<typeof getFeaturedCreators>>[number]

// ── Trending in EDH ───────────────────────────────────────────────────────────

export async function getTrendingEDH() {
  const edhFormat = await db.query.formatTags.findFirst({
    where: eq(formatTags.code, 'edh'),
    columns: { id: true },
  })
  if (!edhFormat) return []

  return db.query.creatorProfiles.findMany({
    where: eq(creatorProfiles.primaryFormatId, edhFormat.id),
    with: {
      primaryFormat: { columns: { colors: true } },
      contentTags: { with: { tag: { columns: { label: true } } } },
      socialAccounts: {
        columns: { platform: true, followers: true },
        orderBy: (s, { desc }) => [desc(s.followers)],
      },
    },
    orderBy: [desc(creatorProfiles.followersTotal)],
    limit: 4,
  })
}

export type TrendingCreator = Awaited<ReturnType<typeof getTrendingEDH>>[number]

// ── Upcoming events ───────────────────────────────────────────────────────────

export async function getUpcomingEvents() {
  const today = new Date().toISOString().slice(0, 10)
  const in60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return db.query.events.findMany({
    where: and(gte(events.startDate, today), lte(events.startDate, in60)),
    with: {
      appearances: { columns: { id: true } },
      region: { columns: { name: true } },
    },
    orderBy: [asc(events.startDate)],
    limit: 3,
  })
}

export type UpcomingEvent = Awaited<ReturnType<typeof getUpcomingEvents>>[number]
