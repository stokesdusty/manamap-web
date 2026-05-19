import { cache } from 'react'
import { eq, ne, and } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles } from '@/db/schema'

export const getCreatorBySlug = cache(async (slug: string) => {
  return db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.slug, slug),
    with: {
      region: true,
      primaryFormat: true,
      socialAccounts: {
        orderBy: (s, { desc }) => [desc(s.followers)],
      },
      formats: {
        with: { format: true },
      },
      contentTags: {
        with: { tag: true },
      },
      featuredContent: {
        orderBy: (fc, { desc }) => [desc(fc.publishedAt)],
        limit: 6,
      },
      appearances: {
        with: { event: true },
      },
    },
  })
})

export type CreatorFull = NonNullable<Awaited<ReturnType<typeof getCreatorBySlug>>>

export async function getSimilarCreators(
  creatorId: number,
  primaryFormatId: number | null,
  limit = 4
) {
  if (!primaryFormatId) return []
  return db.query.creatorProfiles.findMany({
    where: and(
      eq(creatorProfiles.primaryFormatId, primaryFormatId),
      ne(creatorProfiles.id, creatorId)
    ),
    columns: {
      id: true,
      slug: true,
      displayName: true,
      handle: true,
      followersTotal: true,
    },
    orderBy: (cp, { desc }) => [desc(cp.followersTotal)],
    limit,
  })
}
