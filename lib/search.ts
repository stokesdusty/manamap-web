import { and, count, desc, eq, inArray, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { db } from '@/db'
import {
  contentTags,
  creatorContentTags,
  creatorFormats,
  creatorProfiles,
  formatTags,
  regions,
} from '@/db/schema'

// ── Constants ─────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 50

// ── Filter shape (matches validated URL params) ───────────────────────────────

export interface SearchFilters {
  q: string
  formats: string[]
  tags: string[]
  colors: string[]
  audience: string[]
  region: string
  page: number
}

// ── Result shapes ─────────────────────────────────────────────────────────────

export interface SearchRow {
  id: number
  slug: string
  displayName: string
  handle: string | null
  regionName: string | null
  primaryFormatName: string | null
  primaryFormatColors: Array<'w' | 'u' | 'b' | 'r' | 'g'>
  topPlatform: string | null
  topFollowers: number
  tagLabels: string[]
  followersTotal: number
  matchPct: number
}

export interface FacetOption {
  code: string
  label: string
  count: number
}

export interface AllFacets {
  formats: FacetOption[]
  styleTags: FacetOption[]
  audienceTags: FacetOption[]
  regions: FacetOption[]
  colors: FacetOption[]
}

// ── WHERE clause builder ──────────────────────────────────────────────────────

function buildConditions(f: SearchFilters): SQL[] {
  const conds: SQL[] = []

  if (f.q) {
    // FTS with ILIKE fallback for rows where trigger hasn't populated search_vector
    conds.push(sql`(
      ${creatorProfiles.searchVector} @@ websearch_to_tsquery('english', ${f.q})
      OR ${creatorProfiles.displayName} ILIKE ${'%' + f.q + '%'}
      OR ${creatorProfiles.bio} ILIKE ${'%' + f.q + '%'}
    )`)
  }

  if (f.formats.length > 0) {
    conds.push(sql`EXISTS (
      SELECT 1 FROM creator_formats cf
      INNER JOIN format_tags ft ON cf.format_id = ft.id
      WHERE cf.creator_id = ${creatorProfiles.id}
      AND ft.code::text = ANY(${f.formats}::text[])
    )`)
  }

  if (f.tags.length > 0) {
    conds.push(sql`EXISTS (
      SELECT 1 FROM creator_content_tags cct
      INNER JOIN content_tags ct ON cct.tag_id = ct.id
      WHERE cct.creator_id = ${creatorProfiles.id}
      AND ct.code = ANY(${f.tags}::text[])
      AND ct.kind IN ('style', 'theme')
    )`)
  }

  if (f.audience.length > 0) {
    conds.push(sql`EXISTS (
      SELECT 1 FROM creator_content_tags cct
      INNER JOIN content_tags ct ON cct.tag_id = ct.id
      WHERE cct.creator_id = ${creatorProfiles.id}
      AND ct.code = ANY(${f.audience}::text[])
      AND ct.kind = 'audience'
    )`)
  }

  if (f.colors.length > 0) {
    // jsonb_array_elements_text avoids the ?| operator which some drivers escape
    conds.push(sql`EXISTS (
      SELECT 1 FROM creator_formats cf
      INNER JOIN format_tags ft ON cf.format_id = ft.id
      CROSS JOIN LATERAL jsonb_array_elements_text(ft.colors) AS c(val)
      WHERE cf.creator_id = ${creatorProfiles.id}
      AND c.val = ANY(${f.colors}::text[])
    )`)
  }

  if (f.region) {
    conds.push(sql`${creatorProfiles.regionId} = (
      SELECT id FROM regions WHERE code = ${f.region} LIMIT 1
    )`)
  }

  return conds
}

function toWhere(f: SearchFilters): SQL | undefined {
  const conds = buildConditions(f)
  return conds.length > 0 ? and(...conds) : undefined
}

// ── Main search ───────────────────────────────────────────────────────────────

export async function searchCreators(
  filters: SearchFilters
): Promise<{ rows: SearchRow[]; total: number }> {
  const where = toWhere(filters)

  const [{ total }] = await db
    .select({ total: count() })
    .from(creatorProfiles)
    .where(where)

  if (total === 0) return { rows: [], total: 0 }

  const idRows = await db
    .select({ id: creatorProfiles.id })
    .from(creatorProfiles)
    .where(where)
    .orderBy(desc(creatorProfiles.followersTotal))
    .limit(PAGE_SIZE)
    .offset((filters.page - 1) * PAGE_SIZE)

  const ids = idRows.map((r) => r.id)
  if (ids.length === 0) return { rows: [], total }

  const profiles = await db.query.creatorProfiles.findMany({
    where: inArray(creatorProfiles.id, ids),
    with: {
      region: { columns: { name: true } },
      primaryFormat: { columns: { name: true, colors: true } },
      contentTags: { with: { tag: { columns: { code: true, label: true } } } },
      socialAccounts: {
        columns: { platform: true, followers: true },
        orderBy: (s, { desc }) => [desc(s.followers)],
      },
    },
  })

  const byId = new Map(profiles.map((p) => [p.id, p]))

  const rows: SearchRow[] = ids.flatMap((id) => {
    const p = byId.get(id)
    if (!p) return []
    const top = p.socialAccounts[0] ?? null
    return [
      {
        id: p.id,
        slug: p.slug,
        displayName: p.displayName,
        handle: p.handle ?? null,
        regionName: p.region?.name ?? null,
        primaryFormatName: p.primaryFormat?.name ?? null,
        primaryFormatColors: (p.primaryFormat?.colors ?? []) as Array<
          'w' | 'u' | 'b' | 'r' | 'g'
        >,
        topPlatform: top?.platform ?? null,
        topFollowers: top?.followers ?? 0,
        tagLabels: p.contentTags.map((ct) => ct.tag.label),
        followersTotal: p.followersTotal,
        // Deterministic placeholder until Phase 2 ranking engine
        matchPct: 80 + ((p.id * 7 + 3) % 16),
      },
    ]
  })

  return { rows, total }
}

// ── Facet counts (facet-exclusion: each group counts without its own filter) ──

export async function getFacetCounts(filters: SearchFilters): Promise<AllFacets> {
  const [formatRows, styleRows, audienceRows, regionRows, ...colorCounts] = await Promise.all([
    // Formats — exclude format dimension
    db
      .select({
        code: sql<string>`${formatTags.code}::text`,
        label: formatTags.name,
        n: count(),
      })
      .from(creatorFormats)
      .innerJoin(formatTags, eq(creatorFormats.formatId, formatTags.id))
      .innerJoin(creatorProfiles, eq(creatorFormats.creatorId, creatorProfiles.id))
      .where(toWhere({ ...filters, formats: [] }))
      .groupBy(sql`${formatTags.code}::text`, formatTags.name),

    // Style/theme tags — exclude tags dimension
    db
      .select({ code: contentTags.code, label: contentTags.label, n: count() })
      .from(creatorContentTags)
      .innerJoin(contentTags, eq(creatorContentTags.tagId, contentTags.id))
      .innerJoin(creatorProfiles, eq(creatorContentTags.creatorId, creatorProfiles.id))
      .where(
        and(toWhere({ ...filters, tags: [] }), sql`${contentTags.kind} IN ('style', 'theme')`)
      )
      .groupBy(contentTags.code, contentTags.label),

    // Audience tags — exclude audience dimension
    db
      .select({ code: contentTags.code, label: contentTags.label, n: count() })
      .from(creatorContentTags)
      .innerJoin(contentTags, eq(creatorContentTags.tagId, contentTags.id))
      .innerJoin(creatorProfiles, eq(creatorContentTags.creatorId, creatorProfiles.id))
      .where(
        and(toWhere({ ...filters, audience: [] }), sql`${contentTags.kind} = 'audience'`)
      )
      .groupBy(contentTags.code, contentTags.label),

    // Regions — exclude region dimension
    db
      .select({ code: regions.code, label: regions.name, n: count() })
      .from(creatorProfiles)
      .innerJoin(regions, eq(creatorProfiles.regionId, regions.id))
      .where(toWhere({ ...filters, region: '' }))
      .groupBy(regions.code, regions.name),

    // Colors — 5 separate counts (one per pip), exclude colors dimension
    ...(['w', 'u', 'b', 'r', 'g'] as const).map(async (color) => {
      const baseWhere = toWhere({ ...filters, colors: [] })
      const colorExists = sql`EXISTS (
        SELECT 1 FROM creator_formats cf
        INNER JOIN format_tags ft ON cf.format_id = ft.id
        CROSS JOIN LATERAL jsonb_array_elements_text(ft.colors) AS c(val)
        WHERE cf.creator_id = ${creatorProfiles.id}
        AND c.val = ${color}
      )`
      const [{ n }] = await db
        .select({ n: count() })
        .from(creatorProfiles)
        .where(baseWhere ? and(baseWhere, colorExists) : colorExists)
      return { code: color, label: color.toUpperCase(), count: Number(n) }
    }),
  ])

  const COLOR_ORDER = ['w', 'u', 'b', 'r', 'g']

  return {
    formats: formatRows
      .map((r) => ({ code: r.code, label: r.label, count: Number(r.n) }))
      .sort((a, b) => b.count - a.count),
    styleTags: styleRows
      .map((r) => ({ code: r.code, label: r.label, count: Number(r.n) }))
      .sort((a, b) => b.count - a.count),
    audienceTags: audienceRows
      .map((r) => ({ code: r.code, label: r.label, count: Number(r.n) }))
      .sort((a, b) => b.count - a.count),
    regions: regionRows
      .map((r) => ({ code: r.code, label: r.label, count: Number(r.n) }))
      .sort((a, b) => b.count - a.count),
    colors: (colorCounts as Array<{ code: string; label: string; count: number }>).sort(
      (a, b) => COLOR_ORDER.indexOf(a.code) - COLOR_ORDER.indexOf(b.code)
    ),
  }
}

// ── URL builder helpers (used server-side in sidebar) ─────────────────────────

export function buildSearchUrl(f: Partial<SearchFilters> & { page?: number }): string {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.formats?.length) p.set('formats', f.formats.join(','))
  if (f.tags?.length) p.set('tags', f.tags.join(','))
  if (f.audience?.length) p.set('audience', f.audience.join(','))
  if (f.colors?.length) p.set('colors', f.colors.join(','))
  if (f.region) p.set('region', f.region)
  if (f.page && f.page > 1) p.set('page', String(f.page))
  const qs = p.toString()
  return qs ? `/search?${qs}` : '/search'
}

export function toggleFacet(
  filters: SearchFilters,
  dim: 'formats' | 'tags' | 'audience' | 'colors',
  value: string
): string {
  const current = filters[dim]
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
  return buildSearchUrl({ ...filters, [dim]: next, page: 1 })
}

export function setRegion(filters: SearchFilters, code: string): string {
  return buildSearchUrl({ ...filters, region: filters.region === code ? '' : code, page: 1 })
}
