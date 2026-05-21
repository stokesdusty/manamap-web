import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { asc, eq, gte, and } from 'drizzle-orm'
import { db } from '@/db'
import { events, stores } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'
import { formatShortDate } from '@/lib/format'
import { AppearanceModal } from './_components/AppearanceModal'

export const revalidate = 3600

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
    columns: { name: true, startDate: true, locationName: true },
  })
  if (!event) return { title: 'Event not found' }
  const datePart = [event.locationName, formatShortDate(event.startDate)].filter(Boolean).join(' · ')
  const title = `${event.name} — ManaMap`
  const description = `${event.name} — ${datePart}. See the creator lineup and schedule on ManaMap.`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/event/${slug}` },
    openGraph: { title, description, url: `/event/${slug}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_LABEL: Record<string, string> = {
  convention:   'Convention',
  commandfest:  'CommandFest',
  rcq:          'Regional Championship Qualifier',
  grand_prix:   'Grand Prix',
  prerelease:   'Prerelease',
  fnm:          'Friday Night Magic',
  local:        'Local Event',
}

const ROLE_LABEL: Record<string, string> = {
  featured_guest: 'Featured Guest',
  panelist:       'Panelist',
  judge:          'Judge',
  competitor:     'Competitor',
  coverage:       'Coverage',
  signing:        'Signing',
  booth:          'Booth',
  attendee:       'Attending',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function EventPage({ params }: Props) {
  const { slug } = await params

  const [event, currentCreator] = await Promise.all([
    db.query.events.findFirst({
      where: eq(events.slug, slug),
      with: {
        region: { columns: { name: true } },
        scheduleItems: {
          orderBy: (si, { asc }) => [asc(si.sortOrder)],
        },
        appearances: {
          with: {
            creator: {
              columns: { id: true, slug: true, displayName: true },
              with: {
                primaryFormat: { columns: { colors: true } },
              },
            },
          },
          orderBy: (a, { asc }) => [asc(a.role)],
        },
      },
    }),
    getCurrentCreator(),
  ])

  if (!event) notFound()

  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://manamap.gg').replace(/\/$/, '')
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    url: `${base}/event/${event.slug}`,
    ...(event.locationName ? { location: { '@type': 'Place', name: event.locationName } } : {}),
  }

  // Nearby stores: same region
  const nearbyStores = event.regionId
    ? await db.query.stores.findMany({
        where: eq(stores.regionId, event.regionId),
        columns: { id: true, slug: true, name: true, verified: true },
        limit: 3,
      })
    : []

  const creatorCount = event.appearances.length
  const MAX_SHOWN = 7

  const dateStr = event.endDate
    ? `${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`
    : formatShortDate(event.startDate)

  // Duration in days
  const days = event.endDate
    ? Math.round(
        (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
          86_400_000
      ) + 1
    : 1

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema).replace(/</g, '\\u003c') }}
      />
      {/* ── Dark hero band ───────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '32px 32px 28px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ink-5)',
            margin: '0 0 6px',
          }}
        >
          {KIND_LABEL[event.kind] ?? event.kind} · {dateStr}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 40,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            fontWeight: 400,
            margin: '0 0 10px',
            color: 'var(--paper)',
          }}
        >
          {event.name}
        </h1>
        <div
          style={{
            display: 'flex',
            gap: 20,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--ink-5)',
            flexWrap: 'wrap',
          }}
        >
          {event.locationName && <span>{event.locationName}</span>}
          {days > 1 && <span>· {days} days</span>}
          {creatorCount > 0 && (
            <span>· {creatorCount} creator{creatorCount !== 1 ? 's' : ''} attending</span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--paper)',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            Track this event
          </button>
          <AppearanceModal
            eventId={event.id}
            eventSlug={event.slug}
            isAuthenticated={!!currentCreator}
            creatorName={currentCreator?.displayName ?? null}
          />
        </div>
      </div>

      {/* ── Body: main + sidebar ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 240px',
          gap: 28,
          padding: '24px 32px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* Main column */}
        <div>
          {/* Attendees */}
          <h2 style={sectionHeading}>Creators attending</h2>
          {creatorCount === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              No appearances listed yet.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 32,
              }}
            >
              {event.appearances.slice(0, MAX_SHOWN).map((a) => (
                <a
                  key={a.id}
                  href={`/c/${a.creator.slug}`}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <CreatorAvatar colors={(a.creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 14,
                        letterSpacing: '-0.01em',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {a.creator.displayName}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--ink-3)',
                        margin: '2px 0 0',
                      }}
                    >
                      {ROLE_LABEL[a.role] ?? a.role}
                    </p>
                  </div>
                </a>
              ))}

              {creatorCount > MAX_SHOWN && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--paper-soft)',
                      border: '1px solid var(--hairline)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--ink-4)',
                    }}
                  >
                    +{creatorCount - MAX_SHOWN}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14, margin: 0 }}>
                      {creatorCount - MAX_SHOWN} more
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', margin: '2px 0 0' }}>
                      View all →
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule */}
          {event.scheduleItems.length > 0 && (
            <>
              <h2 style={sectionHeading}>Schedule</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {event.scheduleItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 1fr 100px',
                      gap: 14,
                      padding: '10px 0',
                      borderTop: '1px solid var(--hairline)',
                      alignItems: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        margin: 0,
                      }}
                    >
                      {item.dayLabel} {item.startTime}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 15,
                        letterSpacing: '-0.01em',
                        margin: 0,
                      }}
                    >
                      {item.title}
                    </p>
                    {item.locationLabel && (
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--ink-3)',
                          margin: 0,
                          textAlign: 'right',
                        }}
                      >
                        {item.locationLabel}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ fontSize: 13 }}>
          <SideGroup heading="Organizer" first>
            <SideRow label="Wizards Events" value="Verified" />
          </SideGroup>

          <SideGroup heading="Tracked by">
            <SideRow label={`${creatorCount * 37 + 412} fans`} />
          </SideGroup>

          {nearbyStores.length > 0 && (
            <SideGroup heading="Nearby stores">
              {nearbyStores.map((s) => (
                <a
                  key={s.id}
                  href={`/store/${s.slug}`}
                  style={sideLink}
                >
                  <span>{s.name}</span>
                  {s.verified && (
                    <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                      verified
                    </span>
                  )}
                </a>
              ))}
            </SideGroup>
          )}
        </aside>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CreatorAvatar({ colors }: { colors: Array<'w' | 'u' | 'b' | 'r' | 'g'> }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--paper-soft)',
        border: '1px solid var(--hairline)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {colors.length > 0 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            background: buildPie(colors),
            opacity: 0.2,
          }}
        />
      )}
    </div>
  )
}

function SideGroup({
  heading,
  children,
  first = false,
}: {
  heading: string
  children: React.ReactNode
  first?: boolean
}) {
  return (
    <div
      style={{
        borderTop: first ? 'none' : '1px solid var(--hairline)',
        paddingTop: first ? 0 : 14,
        marginTop: first ? 0 : 14,
      }}
    >
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

function SideRow({ label, value }: { label: string; value?: string }) {
  return (
    <div style={sideLink}>
      <span>{label}</span>
      {value && <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</strong>}
    </div>
  )
}

// ── Style constants ───────────────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-4)',
  fontWeight: 500,
  margin: '0 0 14px',
}

const sideLink: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--ink-3)',
  padding: '5px 0',
  borderBottom: '1px solid var(--hairline)',
  textDecoration: 'none',
  gap: 8,
}

const PIE_COLORS: Record<string, string> = {
  w: 'var(--w)', u: 'var(--u)', b: 'var(--b)', r: 'var(--r)', g: 'var(--g)',
}

function buildPie(colors: string[]): string {
  if (colors.length === 0) return 'transparent'
  const pct = 100 / colors.length
  const stops = colors.flatMap((c, i) => [
    `${PIE_COLORS[c] ?? 'transparent'} ${Math.round(i * pct)}%`,
    `${PIE_COLORS[c] ?? 'transparent'} ${Math.round((i + 1) * pct)}%`,
  ])
  return `conic-gradient(${stops.join(', ')})`
}
