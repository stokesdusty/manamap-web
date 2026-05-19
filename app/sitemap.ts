import type { MetadataRoute } from 'next'
import { db } from '@/db'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://manamap.gg').replace(/\/$/, '')

  const [creators, formats, tags, allRegions, allEvents, allStores] = await Promise.all([
    db.query.creatorProfiles.findMany({
      columns: { slug: true, updatedAt: true },
    }),
    db.query.formatTags.findMany({ columns: { code: true } }),
    db.query.contentTags.findMany({ columns: { code: true } }),
    db.query.regions.findMany({ columns: { code: true } }),
    db.query.events.findMany({ columns: { slug: true, updatedAt: true } }),
    db.query.stores.findMany({ columns: { slug: true, updatedAt: true } }),
  ])

  const now = new Date()

  return [
    // Core pages
    { url: base,           lastModified: now,  changeFrequency: 'daily',  priority: 1.0 },
    { url: `${base}/search`, lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${base}/onboard`, changeFrequency: 'monthly', priority: 0.5 },

    // Creator profiles
    ...creators.map((c) => ({
      url: `${base}/c/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Format landing pages
    ...formats.map((f) => ({
      url: `${base}/format/${f.code}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    // Tag landing pages
    ...tags.map((t) => ({
      url: `${base}/tag/${t.code}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    // Region landing pages
    ...allRegions.map((r) => ({
      url: `${base}/region/${r.code}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    // Events
    ...allEvents.map((e) => ({
      url: `${base}/event/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),

    // Stores
    ...allStores.map((s) => ({
      url: `${base}/store/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
