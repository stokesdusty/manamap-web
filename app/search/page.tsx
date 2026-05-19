import type { Metadata } from 'next'
import { z } from 'zod'
import { Chip } from '@/components/ui/Chip'
import { Pip } from '@/components/ui/Pip'
import { Hairline } from '@/components/ui/Hairline'
import { FacetSidebar } from './_components/FacetSidebar'
import {
  searchCreators,
  getFacetCounts,
  buildSearchUrl,
  type SearchFilters,
  type SearchRow,
  PAGE_SIZE,
} from '@/lib/search'
import { PLATFORM_LABEL, formatCount } from '@/lib/format'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Search Creators',
  description:
    'Search MTG creators by format, content style, audience, and region.',
}

// ── searchParams schema ───────────────────────────────────────────────────────

function csvField() {
  return z.preprocess(
    (v) => (Array.isArray(v) ? v.join(',') : (v ?? '')),
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  )
}

const searchParamsSchema = z.object({
  q: z.preprocess((v) => v ?? '', z.string().trim().max(200)).default(''),
  formats: csvField(),
  tags: csvField(),
  colors: csvField(),
  audience: csvField(),
  region: z.preprocess((v) => v ?? '', z.string().trim()).default(''),
  page: z.preprocess((v) => v ?? '1', z.coerce.number().int().min(1).max(999).catch(1)),
})

// ── Page ──────────────────────────────────────────────────────────────────────

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function SearchPage({ searchParams }: Props) {
  const raw = await searchParams
  const parsed = searchParamsSchema.safeParse(raw)
  const filters: SearchFilters = parsed.success
    ? parsed.data
    : { q: '', formats: [], tags: [], colors: [], audience: [], region: '', page: 1 }

  const [{ rows, total }, facets] = await Promise.all([
    searchCreators(filters),
    getFacetCounts(filters),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasAnyFilter =
    filters.q ||
    filters.formats.length > 0 ||
    filters.tags.length > 0 ||
    filters.colors.length > 0 ||
    filters.audience.length > 0 ||
    filters.region

  // Active filter label (for the results header)
  const activeLabels = [
    ...filters.formats,
    ...filters.tags,
    ...filters.audience,
    ...filters.colors.map((c) => c.toUpperCase()),
    ...(filters.region ? [filters.region.toUpperCase()] : []),
  ]

  return (
    <main>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: '1px solid var(--hairline)',
          padding: '20px 32px 0',
          background: 'var(--surface)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              margin: '0 0 16px',
            }}
          >
            {filters.q ? `Results for "${filters.q}"` : 'Discover creators'}
          </h1>
        </div>
      </div>

      {/* ── 2-column layout ─────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          gap: 0,
          alignItems: 'flex-start',
        }}
      >
        {/* Facets */}
        <div
          style={{
            padding: '20px 24px',
            borderRight: '1px solid var(--hairline)',
            background: 'var(--surface-tint)',
            minHeight: 'calc(100vh - 120px)',
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflowY: 'auto',
          }}
        >
          <FacetSidebar filters={filters} facets={facets} />
        </div>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0, padding: '20px 28px' }}>

          {/* Results header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  color: 'var(--ink)',
                }}
              >
                {total}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-3)',
                }}
              >
                {total === 1 ? 'creator' : 'creators'}
                {activeLabels.length > 0 && ` · ${activeLabels.join(' · ')}`}
              </span>
            </div>
            {hasAnyFilter && (
              <a
                href="/search"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-3)',
                  textDecoration: 'none',
                }}
              >
                Clear
              </a>
            )}
          </div>

          <Hairline style={{ marginBottom: 0 }} />

          {/* Result rows */}
          {rows.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-4)',
                padding: '48px 0',
              }}
            >
              No creators match these filters.
            </p>
          ) : (
            rows.map((row) => <ResultRow key={row.id} row={row} />)
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination filters={filters} page={filters.page} totalPages={totalPages} />
          )}
        </div>
      </div>
    </main>
  )
}

// ── Result row ────────────────────────────────────────────────────────────────

function ResultRow({ row }: { row: SearchRow }) {
  const platformLabel = row.topPlatform ? (PLATFORM_LABEL[row.topPlatform] ?? row.topPlatform) : null

  return (
    <a
      href={`/c/${row.slug}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '52px 1fr 96px 72px',
        gap: 16,
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid var(--hairline)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Avatar — circular placeholder with colour-pie decoration */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--paper-soft)',
          border: '1px solid var(--hairline)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {row.primaryFormatColors.length > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              background: buildColorPie(row.primaryFormatColors),
              opacity: 0.2,
            }}
          />
        )}
      </div>

      {/* Creator info */}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            letterSpacing: '-0.01em',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {row.displayName}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ink-3)',
            margin: '2px 0 6px',
          }}
        >
          {[
            row.handle ? `@${row.handle}` : null,
            row.regionName,
            row.primaryFormatName,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {row.tagLabels.slice(0, 4).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>

      {/* Top platform stat */}
      <div style={{ textAlign: 'right' }}>
        {platformLabel && (
          <>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {formatCount(row.topFollowers)}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ink-4)',
                margin: '2px 0 0',
              }}
            >
              {platformLabel}
            </p>
          </>
        )}
      </div>

      {/* Match % */}
      <div style={{ textAlign: 'right' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {row.matchPct}
          <span style={{ color: 'var(--ink-4)' }}>%</span>
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ink-4)',
            margin: '2px 0 0',
          }}
        >
          Match
        </p>
      </div>
    </a>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  filters,
  page,
  totalPages,
}: {
  filters: SearchFilters
  page: number
  totalPages: number
}) {
  const prev = page > 1 ? buildSearchUrl({ ...filters, page: page - 1 }) : null
  const next = page < totalPages ? buildSearchUrl({ ...filters, page: page + 1 }) : null

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--ink-3)',
      }}
    >
      {prev ? (
        <a href={prev} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          ← Previous
        </a>
      ) : (
        <span />
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {next ? (
        <a href={next} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          Next →
        </a>
      ) : (
        <span />
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PIE_COLORS: Record<string, string> = {
  w: 'var(--w)', u: 'var(--u)', b: 'var(--b)', r: 'var(--r)', g: 'var(--g)',
}

function buildColorPie(colors: string[]): string {
  if (colors.length === 0) return 'transparent'
  const pct = 100 / colors.length
  const stops = colors.flatMap((c, i) => {
    const from = Math.round(i * pct)
    const to = Math.round((i + 1) * pct)
    return [`${PIE_COLORS[c] ?? 'transparent'} ${from}%`, `${PIE_COLORS[c] ?? 'transparent'} ${to}%`]
  })
  return `conic-gradient(${stops.join(', ')})`
}
