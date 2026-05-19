import type { Metadata } from 'next'
import { Pip } from '@/components/ui/Pip'
import { Chip } from '@/components/ui/Chip'
import { SearchBar } from './_components/SearchBar'
import { getFeaturedCreators, getTrendingEDH, getUpcomingEvents } from '@/lib/homepage'
import { PLATFORM_LABEL, formatCount, formatShortDate } from '@/lib/format'
import type { FeaturedCreator, TrendingCreator, UpcomingEvent } from '@/lib/homepage'

export const revalidate = 3600 // re-render hourly; events are date-sensitive

export const metadata: Metadata = {
  title: 'ManaMap — The MTG Creator Directory',
  description:
    'Find MTG creators by format, content style, audience, and region. See where they\'re streaming, posting, and showing up next.',
}

// ── Color-rail config ─────────────────────────────────────────────────────────

const COLOR_RAIL = [
  { color: 'w', label: 'White' },
  { color: 'u', label: 'Blue'  },
  { color: 'b', label: 'Black' },
  { color: 'r', label: 'Red'   },
  { color: 'g', label: 'Green' },
] as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, trending, upcomingEvents] = await Promise.all([
    getFeaturedCreators(),
    getTrendingEDH(),
    getUpcomingEvents(),
  ])

  const [hero, ...sideCards] = featured

  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '36px 0 28px',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-3)',
              marginBottom: 16,
            }}
          >
            The directory for MTG creators
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              fontWeight: 400,
              margin: '0 0 14px',
              maxWidth: '18ch',
            }}
          >
            Find the people behind{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>
              the format you love.
            </em>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: 'var(--ink-2)',
              maxWidth: '52ch',
              lineHeight: 1.55,
              margin: '0 0 22px',
            }}
          >
            Search creators by format, content style, audience, and region.
            See where they&apos;re streaming, posting, and showing up next.
          </p>

          <SearchBar />

          {/* Color-pie chip rail */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-4)',
              flexWrap: 'wrap',
            }}
          >
            <span>Filter by color:</span>
            {COLOR_RAIL.map(({ color, label }) => (
              <a
                key={color}
                href={`/search?colors=${color}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  border: '1px solid var(--hairline)',
                  borderRadius: 999,
                  background: 'var(--surface)',
                  textDecoration: 'none',
                  color: 'var(--ink-3)',
                  cursor: 'pointer',
                }}
              >
                <Pip color={color} size="sm" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 64px' }}>

        {/* Featured this week */}
        <SectionHead title="Featured this week" moreHref="/search" moreLabel="View all →" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr',
            gap: 14,
          }}
        >
          {hero && <FeaturedHeroCard creator={hero} />}
          {sideCards.map((c) => <StandardCreatorCard key={c.id} creator={c} />)}
        </div>

        {/* Trending in EDH */}
        <SectionHead
          title="Trending in EDH"
          moreHref="/search?formats=edh"
          moreLabel="More →"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
          }}
        >
          {trending.map((c) => <TrendingCard key={c.id} creator={c} />)}
        </div>

        {/* Happening soon */}
        <SectionHead
          title="Happening soon near you"
          moreHref="/event"
          moreLabel="All events →"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 14,
          }}
        >
          {upcomingEvents.map((ev) => <EventCard key={ev.id} event={ev} />)}
        </div>
      </div>
    </main>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHead({
  title,
  moreHref,
  moreLabel,
}: {
  title: string
  moreHref: string
  moreLabel: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        margin: '32px 0 14px',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <a
        href={moreHref}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-3)',
          textDecoration: 'none',
        }}
      >
        {moreLabel}
      </a>
    </div>
  )
}

// ── Featured hero card (dark, 1.4fr) ─────────────────────────────────────────

function FeaturedHeroCard({ creator }: { creator: FeaturedCreator }) {
  const colors = (creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>
  const topTwo = creator.socialAccounts.slice(0, 2)

  return (
    <a
      href={`/c/${creator.slug}`}
      style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        borderRadius: 10,
        padding: '22px 22px 18px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 220,
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-5)',
        }}
      >
        Creator of the week
      </span>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 32,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '6px 0 4px',
          color: 'var(--paper)',
        }}
      >
        {creator.displayName}
      </p>

      {creator.bio && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--ink-5)',
            maxWidth: '30ch',
            lineHeight: 1.45,
            margin: 0,
          }}
        >
          {creator.bio.length > 100 ? `${creator.bio.slice(0, 98)}…` : creator.bio}
        </p>
      )}

      {/* Color identity pips */}
      {colors.length > 0 && (
        <div
          style={{ display: 'flex', gap: 6, marginTop: 12 }}
          aria-label="Color identity"
        >
          {colors.map((c) => (
            <Pip key={c} color={c} size="sm" />
          ))}
        </div>
      )}

      {/* Platform stats */}
      {topTwo.length > 0 && (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            display: 'flex',
            gap: 14,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ink-5)',
          }}
        >
          {topTwo.map((p) => (
            <span key={p.platform}>
              {PLATFORM_LABEL[p.platform]?.slice(0, 2).toUpperCase() ?? p.platform.slice(0, 2).toUpperCase()}
              {' · '}
              {formatCount(p.followers)}
            </span>
          ))}
          {creator.region && <span>{creator.region.name.split(' ').slice(-1)[0]}</span>}
        </div>
      )}
    </a>
  )
}

// ── Standard creator card (featured row, 1fr) ─────────────────────────────────

function StandardCreatorCard({ creator }: { creator: FeaturedCreator }) {
  const colors = (creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>
  const top = creator.socialAccounts[0]
  const platform2 = creator.socialAccounts[1]

  return (
    <a
      href={`/c/${creator.slug}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Avatar area with colorbar */}
      <div
        style={{
          height: 96,
          background:
            'repeating-linear-gradient(45deg, var(--paper-soft) 0 6px, var(--paper) 6px 12px)',
          position: 'relative',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        {colors.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              display: 'flex',
            }}
          >
            {colors.map((c) => (
              <span
                key={c}
                style={{ flex: 1, backgroundColor: `var(--${c})` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flex: 1,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {creator.displayName}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ink-3)',
            margin: 0,
          }}
        >
          {creator.handle ? `@${creator.handle}` : null}
          {creator.handle && creator.region ? ' · ' : ''}
          {creator.region?.name}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {creator.contentTags.slice(0, 2).map((ct) => (
            <Chip key={ct.tag.label}>{ct.tag.label}</Chip>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {(top || platform2) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderTop: '1px solid var(--hairline)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ink-3)',
          }}
        >
          {[top, platform2].filter(Boolean).map((p) => (
            <span key={p!.platform}>
              {PLATFORM_LABEL[p!.platform]?.slice(0, 2).toUpperCase() ?? '??'}{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>
                {formatCount(p!.followers)}
              </strong>
            </span>
          ))}
        </div>
      )}
    </a>
  )
}

// ── Trending card (4-column grid) ─────────────────────────────────────────────

function TrendingCard({ creator }: { creator: TrendingCreator }) {
  const colors = (creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>

  return (
    <a
      href={`/c/${creator.slug}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Avatar area */}
      <div
        style={{
          height: 72,
          background:
            'repeating-linear-gradient(45deg, var(--paper-soft) 0 6px, var(--paper) 6px 12px)',
          position: 'relative',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        {colors.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              display: 'flex',
            }}
          >
            {colors.map((c) => (
              <span key={c} style={{ flex: 1, backgroundColor: `var(--${c})` }} />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {creator.displayName}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ink-3)',
            margin: 0,
          }}
        >
          {creator.handle ? `@${creator.handle}` : `/${creator.slug}`}
        </p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
          {creator.contentTags.slice(0, 1).map((ct) => (
            <Chip key={ct.tag.label}>{ct.tag.label}</Chip>
          ))}
        </div>
      </div>
    </a>
  )
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: UpcomingEvent }) {
  const dateStr = formatShortDate(event.startDate)
  const [month, day] = dateStr.split(' ')
  const creatorCount = event.appearances.length
  const endStr = event.endDate ? ` · ${formatShortDate(event.endDate).split(' ').join(' ')}` : ''
  const kindLabel = event.kind.replace(/_/g, ' ')

  return (
    <a
      href={`/event/${event.slug}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 14,
        display: 'flex',
        gap: 14,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Date column */}
      <div
        style={{
          textAlign: 'center',
          borderRight: '1px solid var(--hairline)',
          paddingRight: 14,
          flexShrink: 0,
          minWidth: 36,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ink-3)',
            margin: 0,
          }}
        >
          {month}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 28,
            lineHeight: 1,
            color: 'var(--ink)',
            margin: '2px 0 0',
          }}
        >
          {day}
        </p>
      </div>

      {/* Event info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            letterSpacing: '-0.01em',
            margin: '0 0 3px',
            lineHeight: 1.2,
          }}
        >
          {event.name}
        </p>
        {event.locationName && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-3)',
              margin: '0 0 4px',
            }}
          >
            {event.locationName.split(',')[0]}
            {endStr}
          </p>
        )}
        {creatorCount > 0 && (
          <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>
            {creatorCount} creator{creatorCount !== 1 ? 's' : ''} attending
          </p>
        )}
        {creatorCount === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-4)',
              margin: 0,
            }}
          >
            {kindLabel}
          </p>
        )}
      </div>
    </a>
  )
}
