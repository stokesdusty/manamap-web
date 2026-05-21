import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles, events, regions } from '@/db/schema'
import { CreatorTile } from '@/components/ui/CreatorTile'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { formatShortDate } from '@/lib/format'

export const revalidate = 3600

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const rows = await db.query.regions.findMany({ columns: { code: true } })
  return rows.map((r) => ({ code: r.code }))
}

// ── Editorial copy (placeholder — edit in place) ──────────────────────────────

const COPY: Partial<Record<string, readonly [string, string]>> = {
  'us-pnw': [
    `The US Pacific Northwest is one of the most active Magic scenes in North America. From Seattle's Card Kingdom to Portland's Ground Kontrol, the region has cultivated a community spanning competitive events, casual leagues, and creator-run meetups.`,
    `PNW creators have an outsized presence in the MTG content world relative to the region's size. Find them here, follow their events calendar, and connect with the local scene — whether you're streaming from a Bellevue studio or brewing in a Portland basement.`,
  ],
  'us-west': [
    `The US West Coast Magic scene stretches from Southern California's tournament circuit to the Bay Area's independent stores and the Las Vegas convention hub. It's a metagame that leans competitive, moves fast, and produces some of Magic's most influential content.`,
    `West Coast creators are often the first to break new Standard and Modern innovations — proximity to large player pools and a culture of competitive play makes the region a consistent source of format-defining analysis.`,
  ],
  'us-east': [
    `The US East Coast has one of Magic's oldest and deepest competitive histories. New York, Philadelphia, and the Mid-Atlantic corridor have been producing top-level players and content creators since the game's earliest days.`,
    `From Legacy specialists in New England to EDH communities across the Mid-Atlantic, East Coast creators bring a depth of format knowledge and historical perspective that's hard to find elsewhere.`,
  ],
  'us-south': [
    `The US South has a passionate and growing Magic community centered around Houston's game store scene, Atlanta's CommandFest presence, and a grassroots network of creators building audiences outside the traditional coastal hubs.`,
    `Southern creators often span the casual-to-competitive range, reflecting the region's game store culture. Find EDH brewers, budget specialists, and competitive grinders representing one of Magic's fastest-growing content regions.`,
  ],
  'us-midwest': [
    `The US Midwest is Magic's heartland — a region with deep roots in the game's competitive scene and a thriving EDH community built around Chicago, Indianapolis, and the Great Lakes game store networks.`,
    `Midwest creators combine tournament rigor with accessible presentation. Find creators who understand both the competitive scene and the Friday Night Magic player, producing content that works for both audiences.`,
  ],
  canada: [
    `Canada's Magic scene spans Toronto's competitive events, Vancouver's casual community, and a distributed network of creators producing content in English and French. The country has contributed disproportionately to Magic's competitive history.`,
    `Canadian creators on ManaMap range from Pioneer specialists to EDH brewers in Montreal. Follow the Canadian community and discover some of the most technically precise voices in the game.`,
  ],
  eu: [
    `Europe's Magic scene is the game's second home. The UK, Germany, France, and the Nordic countries have produced world champions, legendary content creators, and a tournament circuit that rivals North America in depth and quality.`,
    `European creators bring multilingual reach and a perspective shaped by a different GP circuit, different store culture, and different format preferences. ManaMap tracks them all.`,
  ],
  latam: [
    `Latin America's Magic community has grown dramatically over the past decade, led by a massive Spanish and Portuguese-speaking content scene and a competitive circuit centered on Mexico City, São Paulo, and Buenos Aires.`,
    `LATAM creators are among the highest-growth content producers in ManaMap's directory. Follow the region's voices for content that reaches millions of players across the Americas and a perspective distinctly its own.`,
  ],
  'asia-pacific': [
    `The Asia-Pacific Magic community spans Japan's storied competitive history, South Korea's growing content scene, Australia's GP circuit, and a distributed network of creators producing content for one of the game's largest player markets.`,
    `APAC creators are among Magic's most technically precise — Japan especially has contributed a rigorous analytical tradition to the game's competitive culture. Find them on ManaMap.`,
  ],
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const region = await db.query.regions.findFirst({
    where: eq(regions.code, code),
    columns: { name: true },
  })
  if (!region) return { title: 'Region not found' }

  const title = `MTG Creators in ${region.name} — ManaMap`
  const description = `Find Magic: The Gathering creators based in ${region.name}. Discover local creators, upcoming tournaments, events, and game stores near you.`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/region/${code}` },
    openGraph: { title, description, url: `/region/${code}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RegionPage({ params }: Props) {
  const { code } = await params

  const [region, allRegions] = await Promise.all([
    db.query.regions.findFirst({ where: eq(regions.code, code) }),
    db.query.regions.findMany({ orderBy: (r, { asc }) => [asc(r.name)] }),
  ])
  if (!region) notFound()

  const today = new Date().toISOString().slice(0, 10)
  const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [creators, upcomingEvents] = await Promise.all([
    db.query.creatorProfiles.findMany({
      where: eq(creatorProfiles.regionId, region.id),
      with: {
        primaryFormat: { columns: { colors: true } },
        contentTags: { with: { tag: { columns: { label: true } } } },
      },
      orderBy: [desc(creatorProfiles.followersTotal)],
      limit: 20,
    }),
    db.query.events.findMany({
      where: and(
        eq(events.regionId, region.id),
        gte(events.startDate, today),
        lte(events.startDate, in90)
      ),
      columns: { id: true, slug: true, name: true, startDate: true, locationName: true, kind: true },
      orderBy: [asc(events.startDate)],
      limit: 4,
    }),
  ])

  const [p1, p2] = COPY[code] ?? [
    `${region.name} has a vibrant Magic: The Gathering community, with active game stores, regular tournaments, and a growing creator scene producing content every week.`,
    `ManaMap tracks every ${region.name} creator publishing MTG content. Browse the list below to find your local voices and upcoming events in the region.`,
  ]

  const related = allRegions.filter((r) => r.code !== code)

  return (
    <main>
      {/* ── Hero header ──────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: '1px solid var(--hairline)',
          padding: '64px 32px 56px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Eyebrow style={{ marginBottom: 16 }}>Local Scene</Eyebrow>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.04,
            letterSpacing: '-0.025em',
            fontWeight: 400,
            margin: '0 0 28px',
            maxWidth: '22ch',
          }}
        >
          MTG creators in{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>{region.name}</em>
        </h1>

        <div style={{ maxWidth: '62ch', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{p1}</p>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{p2}</p>
        </div>

        <a href={`/search?region=${code}`} style={ctaLink}>
          Filter + search all {region.name} creators →
        </a>
      </div>

      {/* ── Upcoming events strip ─────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <div
          style={{
            borderBottom: '1px solid var(--hairline)',
            padding: '32px 32px',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          <p style={sectionLabel}>Upcoming events</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}
          >
            {upcomingEvents.map((ev) => {
              const dateStr = formatShortDate(ev.startDate)
              const [month, day] = dateStr.split(' ')
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
                    gap: 12,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      borderRight: '1px solid var(--hairline)',
                      paddingRight: 12,
                      flexShrink: 0,
                    }}
                  >
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: 0 }}>
                      {month}
                    </p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1, color: 'var(--ink)', margin: '2px 0 0' }}>
                      {day}
                    </p>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14, letterSpacing: '-0.01em', margin: '0 0 2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.name}
                    </p>
                    {ev.locationName && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', margin: 0 }}>
                        {ev.locationName.split(',')[0]}
                      </p>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Creator grid ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        {creators.length > 0 ? (
          <>
            <p style={countLabel}>{creators.length} creator{creators.length !== 1 ? 's' : ''} in this region</p>
            <div style={grid4}>
              {creators.map((c) => (
                <CreatorTile
                  key={c.id}
                  slug={c.slug}
                  displayName={c.displayName}
                  handle={c.handle ?? null}
                  colors={(c.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>}
                  tagLabels={c.contentTags.map((ct) => ct.tag.label)}
                />
              ))}
            </div>
          </>
        ) : (
          <p style={emptyLabel}>No creators listed in this region yet.</p>
        )}
      </div>

      {/* ── Related regions ───────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 64px', borderTop: '1px solid var(--hairline)', paddingTop: 32 }}>
        <p style={alsoSeeLabel}>Also see:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {related.map((r) => (
            <a key={r.code} href={`/region/${r.code}`} style={{ textDecoration: 'none' }}>
              <Chip>{r.name}</Chip>
            </a>
          ))}
          <a href="/search" style={{ textDecoration: 'none' }}>
            <Chip>All creators →</Chip>
          </a>
        </div>
      </div>
    </main>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const ctaLink: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 24,
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-3)',
  textDecoration: 'none',
  borderBottom: '1px solid var(--hairline-strong)',
  paddingBottom: 1,
}

const grid4: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 14,
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-4)',
  fontWeight: 500,
  margin: '0 0 14px',
}

const countLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-4)',
  margin: '0 0 16px',
}

const emptyLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-4)',
}

const alsoSeeLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-3)',
  margin: '0 0 12px',
}
