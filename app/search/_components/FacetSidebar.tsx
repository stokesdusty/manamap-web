import { Pip } from '@/components/ui/Pip'
import { Hairline } from '@/components/ui/Hairline'
import type { AllFacets, FacetOption, SearchFilters } from '@/lib/search'
import { buildSearchUrl, setRegion, toggleFacet } from '@/lib/search'

interface Props {
  filters: SearchFilters
  facets: AllFacets
}

const COLOR_NAMES: Record<string, string> = {
  w: 'White', u: 'Blue', b: 'Black', r: 'Red', g: 'Green',
}

// ── Top-level sidebar ─────────────────────────────────────────────────────────

export function FacetSidebar({ filters, facets }: Props) {
  const hasAnyFilter =
    filters.formats.length > 0 ||
    filters.tags.length > 0 ||
    filters.audience.length > 0 ||
    filters.colors.length > 0 ||
    filters.region !== ''

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        fontSize: 13,
      }}
    >
      {/* Search box — GET form preserves all other filters */}
      <form method="GET" action="/search" style={{ marginBottom: 20 }}>
        {filters.formats.length > 0 && (
          <input type="hidden" name="formats" value={filters.formats.join(',')} />
        )}
        {filters.tags.length > 0 && (
          <input type="hidden" name="tags" value={filters.tags.join(',')} />
        )}
        {filters.audience.length > 0 && (
          <input type="hidden" name="audience" value={filters.audience.join(',')} />
        )}
        {filters.colors.length > 0 && (
          <input type="hidden" name="colors" value={filters.colors.join(',')} />
        )}
        {filters.region && (
          <input type="hidden" name="region" value={filters.region} />
        )}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search creators…"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--ink)',
              padding: '8px 10px',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0 10px',
              cursor: 'pointer',
              color: 'var(--ink-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
            }}
          >
            GO
          </button>
        </div>
      </form>

      {hasAnyFilter && (
        <div style={{ marginBottom: 16 }}>
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
            ← Clear all filters
          </a>
        </div>
      )}

      <FacetGroup heading="Formats">
        {facets.formats.map((opt) => (
          <FacetLink
            key={opt.code}
            opt={opt}
            active={filters.formats.includes(opt.code)}
            href={toggleFacet(filters, 'formats', opt.code)}
          />
        ))}
      </FacetGroup>

      <FacetGroup heading="Colors">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
          {facets.colors.map((opt) => {
            const active = filters.colors.includes(opt.code)
            const color = opt.code as 'w' | 'u' | 'b' | 'r' | 'g'
            return (
              <a
                key={opt.code}
                href={toggleFacet(filters, 'colors', opt.code)}
                title={`${COLOR_NAMES[opt.code] ?? opt.code} (${opt.count})`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 8px',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline-strong)'}`,
                  borderRadius: 999,
                  background: active ? 'var(--ink)' : 'var(--surface)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: active ? 'var(--paper)' : 'var(--ink-3)',
                }}
              >
                <Pip color={color} size="sm" />
                {opt.code.toUpperCase()}
                {opt.count > 0 && (
                  <span style={{ color: active ? 'var(--ink-5)' : 'var(--ink-4)' }}>
                    {opt.count}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </FacetGroup>

      <FacetGroup heading="Content type">
        {facets.styleTags.map((opt) => (
          <FacetLink
            key={opt.code}
            opt={opt}
            active={filters.tags.includes(opt.code)}
            href={toggleFacet(filters, 'tags', opt.code)}
          />
        ))}
      </FacetGroup>

      <FacetGroup heading="Audience">
        {facets.audienceTags.map((opt) => (
          <FacetLink
            key={opt.code}
            opt={opt}
            active={filters.audience.includes(opt.code)}
            href={toggleFacet(filters, 'audience', opt.code)}
          />
        ))}
      </FacetGroup>

      <FacetGroup heading="Region">
        {facets.regions.map((opt) => (
          <FacetLink
            key={opt.code}
            opt={opt}
            active={filters.region === opt.code}
            href={setRegion(filters, opt.code)}
          />
        ))}
      </FacetGroup>
    </aside>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FacetGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-4)',
          fontWeight: 500,
          margin: '0 0 8px',
        }}
      >
        {heading}
      </p>
      {children}
    </div>
  )
}

function FacetLink({
  opt,
  active,
  href,
}: {
  opt: FacetOption
  active: boolean
  href: string
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '3px 0',
        textDecoration: 'none',
        fontSize: 12,
        color: active ? 'var(--ink)' : 'var(--ink-2)',
        fontWeight: active ? 500 : 400,
      }}
    >
      {/* Checkbox visual */}
      <span
        style={{
          width: 12,
          height: 12,
          border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline-strong)'}`,
          borderRadius: 3,
          background: active ? 'var(--ink)' : 'var(--surface)',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {active && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ flex: 1 }}>{opt.label}</span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--ink-4)',
          marginLeft: 'auto',
        }}
      >
        {opt.count}
      </span>
    </a>
  )
}
