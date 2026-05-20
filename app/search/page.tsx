import type { Metadata } from 'next'
import { z } from 'zod'
import { Chip } from '@/components/ui/Chip'
import { Pip } from '@/components/ui/Pip'
import { Hairline } from '@/components/ui/Hairline'
import { FacetSidebar } from './_components/FacetSidebar'
import { FiltersDrawer } from '@/components/search/FiltersDrawer'
import {
  searchCreators,
  getFacetCounts,
  getEmptyStateSuggestions,
  buildSearchUrl,
  type SearchFilters,
  type SearchRow,
  type EmptyStateSuggestion,
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
    !!filters.q ||
    filters.formats.length > 0 ||
    filters.tags.length > 0 ||
    filters.colors.length > 0 ||
    filters.audience.length > 0 ||
    !!filters.region

  // Only compute suggestions on empty result paths — parallel with nothing else
  const suggestions: EmptyStateSuggestion[] =
    total === 0 && hasAnyFilter ? await getEmptyStateSuggestions(filters) : []

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
          background: 'var(--surface)',
        }}
        className="px-5 pt-5 md:px-8"
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
        {/* Facets — desktop only */}
        <div
          className="hidden md:block"
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
        <div className="px-5 py-5 md:px-7" style={{ flex: 1, minWidth: 0 }}>

          {/* Mobile filter trigger */}
          <div className="md:hidden" style={{ marginBottom: 16 }}>
            <FiltersDrawer filterCount={filters.formats.length + filters.tags.length + filters.colors.length + filters.audience.length + (filters.region ? 1 : 0)}>
              <FacetSidebar filters={filters} facets={facets} />
            </FiltersDrawer>
          </div>

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

          {/* Result rows or empty state */}
          {rows.length === 0 ? (
            <EmptyState filters={filters} suggestions={suggestions} />
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

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  filters,
  suggestions,
}: {
  filters: SearchFilters
  suggestions: EmptyStateSuggestion[]
}) {
  // Build a human-readable description of the active filters
  const activeFilters = [
    ...filters.formats,
    ...filters.tags,
    ...filters.audience,
    ...filters.colors.map((c) => c.toUpperCase()),
    ...(filters.region ? [filters.region.toUpperCase()] : []),
  ]

  const descParts = filters.q
    ? [`"${filters.q}"`, ...activeFilters]
    : activeFilters

  return (
    <div style={{ padding: '48px 0' }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-4)',
          margin: '0 0 12px',
        }}
      >
        No matches for {descParts.join(' + ')}
      </p>

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-5)',
              margin: 0,
            }}
          >
            Try removing:
          </p>
          {suggestions.map((s) => (
            <a
              key={s.label}
              href={s.href}
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textDecoration: 'none',
                color: 'var(--ink-2)',
              }}
            >
              <span
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                {s.label}
              </span>
              <span style={{ color: 'var(--ink-4)' }}>
                ({s.count} result{s.count !== 1 ? 's' : ''})
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Result row ────────────────────────────────────────────────────────────────

function ResultRow({ row }: { row: SearchRow }) {
  const platformLabel = row.topPlatform ? (PLATFORM_LABEL[row.topPlatform] ?? row.topPlatform) : null

  return (
    <a href={`/c/${row.slug}`} className="result-row">
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--paper-soft)',
          border: '1px solid var(--hairline)',
          flexShrink: 0,
        }}
      />

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

        {/* Metadata line: @handle · region · color pips + format */}
        <MetaLine row={row} />

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {row.tagLabels.slice(0, 4).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>

      {/* Top platform stat */}
      <div className="result-row-stat" style={{ textAlign: 'right' }}>
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

      {/* Match % — Phase 2 placeholder */}
      <div className="result-row-match" style={{ textAlign: 'right' }}>
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

// Inline metadata line with handle, region, and colour pips + format name
function MetaLine({ row }: { row: SearchRow }) {
  const monoStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--ink-3)',
  }
  const sep = (
    <span aria-hidden="true" style={{ color: 'var(--ink-5)', margin: '0 1px' }}>
      ·
    </span>
  )

  const parts: React.ReactNode[] = []

  if (row.handle) parts.push(<span key="handle" style={monoStyle}>@{row.handle}</span>)
  if (row.regionName) {
    if (parts.length > 0) parts.push(sep)
    parts.push(<span key="region" style={monoStyle}>{row.regionName}</span>)
  }
  if (row.primaryFormatColors.length > 0 || row.primaryFormatName) {
    if (parts.length > 0) parts.push(sep)
    if (row.primaryFormatColors.length > 0) {
      parts.push(
        <span key="pips" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {row.primaryFormatColors.map((c) => (
            <Pip key={c} color={c} size="sm" />
          ))}
        </span>
      )
    }
    if (row.primaryFormatName) {
      if (row.primaryFormatColors.length > 0) parts.push(<span key="pip-gap" style={{ display: 'inline-block', width: 3 }} />)
      parts.push(<span key="format" style={monoStyle}>{row.primaryFormatName}</span>)
    }
  }

  if (parts.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        margin: '2px 0 0',
      }}
    >
      {parts}
    </div>
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
