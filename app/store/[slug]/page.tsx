import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { events, stores } from '@/db/schema'
import { formatShortDate, formatCount } from '@/lib/format'
import { Chip } from '@/components/ui/Chip'
import { Pip } from '@/components/ui/Pip'

export const revalidate = 3600

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const store = await db.query.stores.findFirst({
    where: eq(stores.slug, slug),
    columns: { name: true, address: true },
  })
  if (!store) return { title: 'Store not found' }
  const title = `${store.name} — ManaMap`
  const description = `${store.name}${store.address ? ` · ${store.address}` : ''} — local game store profile and event calendar on ManaMap.`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/store/${slug}` },
    openGraph: { title, description, url: `/store/${slug}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StorePage({ params }: Props) {
  const { slug } = await params

  const store = await db.query.stores.findFirst({
    where: eq(stores.slug, slug),
    with: {
      region: { columns: { name: true } },
      storeCreators: {
        with: {
          creator: {
            columns: { id: true, slug: true, displayName: true, followersTotal: true },
            with: { primaryFormat: { columns: { colors: true } } },
          },
        },
      },
    },
  })

  if (!store) notFound()

  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://manamap.gg').replace(/\/$/, '')
  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    url: `${base}/store/${store.slug}`,
    ...(store.address ? { address: { '@type': 'PostalAddress', streetAddress: store.address } } : {}),
    ...(store.website ? { sameAs: store.website } : {}),
    ...(store.region ? { areaServed: store.region.name } : {}),
  }

  const today = new Date().toISOString().slice(0, 10)
  const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const upcomingEvents = await db.query.events.findMany({
    where: and(eq(events.storeId, store.id), gte(events.startDate, today), lte(events.startDate, in90)),
    with: { appearances: { columns: { id: true } } },
    orderBy: [asc(events.startDate)],
    limit: 5,
  })

  // Stats: event count in last 30d, resident creator count, stub followers
  const d30ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const recentEvents = await db.query.events.findMany({
    where: and(eq(events.storeId, store.id), gte(events.startDate, d30ago), lte(events.startDate, today)),
    columns: { id: true },
  })

  const residentCount = store.storeCreators.filter((sc) => sc.role.toLowerCase() === 'resident').length

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema).replace(/</g, '\\u003c') }}
      />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        {/* Left */}
        <div style={{ padding: 28 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink-3)',
              margin: '0 0 4px',
            }}
          >
            Local Game Store{store.verified ? ' · Verified' : ''}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              margin: '0 0 6px',
            }}
          >
            {store.name}
          </h1>
          {store.address && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ink-3)',
                margin: '0 0 12px',
              }}
            >
              {store.address}
            </p>
          )}
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ink-3)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--hairline-strong)',
              }}
            >
              {store.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 18,
              paddingTop: 18,
              borderTop: '1px solid var(--hairline)',
            }}
          >
            {[
              { n: recentEvents.length, label: 'Events · 30d'       },
              { n: residentCount,       label: 'Resident creators'   },
              { n: 820,                 label: 'Followers'           },
            ].map(({ n, label }) => (
              <div key={label}>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 24,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {n}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ink-3)',
                    margin: '4px 0 0',
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo placeholder */}
        <div
          style={{
            background:
              'repeating-linear-gradient(135deg, var(--paper-soft) 0 10px, var(--paper) 10px 20px)',
            minHeight: 220,
            borderLeft: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-4)',
            }}
          >
            Store photo
          </span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          padding: '22px 28px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* Left: upcoming events */}
        <div>
          <h2 style={sectionH}>Upcoming events</h2>
          {upcomingEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              No events scheduled.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingEvents.map((ev) => {
                const dateStr = formatShortDate(ev.startDate)
                const [month, day] = dateStr.split(' ')
                const count = ev.appearances.length
                return (
                  <a
                    key={ev.id}
                    href={`/event/${ev.slug}`}
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
                    <div
                      style={{
                        textAlign: 'center',
                        borderRight: '1px solid var(--hairline)',
                        paddingRight: 14,
                        flexShrink: 0,
                        minWidth: 36,
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: 0 }}>
                        {month}
                      </p>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1, color: 'var(--ink)', margin: '2px 0 0' }}>
                        {day}
                      </p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, letterSpacing: '-0.01em', margin: '0 0 3px', lineHeight: 1.2 }}>
                        {ev.name}
                      </p>
                      {ev.locationName && (
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: '0 0 3px' }}>
                          {ev.locationName.split(',')[0]}
                        </p>
                      )}
                      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>
                        {count > 0
                          ? `${count} creator${count !== 1 ? 's' : ''} attending`
                          : 'Open event'}
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: featured creators */}
        <div>
          <h2 style={sectionH}>Featured creators</h2>
          {store.storeCreators.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              No featured creators yet.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 20,
              }}
            >
              {store.storeCreators.map((sc) => {
                const colors = (sc.creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>
                return (
                  <a
                    key={sc.creatorId}
                    href={`/c/${sc.creator.slug}`}
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
                    {/* Color bar avatar */}
                    <div
                      style={{
                        height: 64,
                        background: 'repeating-linear-gradient(45deg, var(--paper-soft) 0 6px, var(--paper) 6px 12px)',
                        position: 'relative',
                        borderBottom: '1px solid var(--hairline)',
                      }}
                    >
                      {colors.length > 0 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, display: 'flex' }}>
                          {colors.map((c) => (
                            <span key={c} style={{ flex: 1, backgroundColor: `var(--${c})` }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, letterSpacing: '-0.01em', margin: '0 0 3px' }}>
                        {sc.creator.displayName}
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: 0 }}>
                        {sc.role}{sc.note ? ` · ${sc.note}` : ''}
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          )}

          {/* Booking marketplace note */}
          <div
            style={{
              background: 'var(--surface-tint)',
              border: '1px solid var(--hairline)',
              borderRadius: 6,
              padding: '14px 18px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--ink-4)',
                margin: '0 0 4px',
              }}
            >
              Booking marketplace
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Invite a creator to your next event. ManaMap handles the inquiry, contract template, and payment escrow.
            </p>
            <button
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 500,
                padding: '7px 16px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--ink)',
                color: 'var(--paper)',
                cursor: 'pointer',
              }}
            >
              Open booking marketplace
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const sectionH: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-4)',
  fontWeight: 500,
  margin: '0 0 14px',
}
