import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles, formatTags } from '@/db/schema'
import { CreatorTile } from '@/components/ui/CreatorTile'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'

export const revalidate = 3600

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const rows = await db.query.formatTags.findMany({ columns: { code: true } })
  return rows.map((r) => ({ code: r.code }))
}

// ── Editorial copy (placeholder — edit in place) ──────────────────────────────

const COPY: Partial<Record<string, readonly [string, string]>> = {
  edh: [
    `Commander is the most popular Magic format in the world — a 100-card singleton game built around a legendary creature and the shared dynamics of a four-player table. The format rewards creativity, political awareness, and a deep knowledge of underplayed cards.`,
    `ManaMap tracks every Commander creator publishing content today: budget brewers squeezing power from $50 decks, cEDH pilots chasing the most consistent turn-three wins, and educators helping new players find their first commander. Filter by content style to find the voice that fits your table.`,
  ],
  cedh: [
    `Competitive EDH is Commander stripped of the social contract — a solved-but-evolving metagame where the goal is to win as efficiently as possible, typically through fast combos, stax pieces, and counterspell wars over the stack.`,
    `The cEDH creator community is small but extraordinarily dense. These are players who publish primers, track the shifting meta, and break down the engine decisions that separate a 65% deck from a true tier-one list.`,
  ],
  modern: [
    `Modern is Magic's deepest eternal format: a card pool stretching back to 2003, a live tournament circuit, and a metagame that shifts every few weeks. Mastery takes years; the right content community is the fastest shortcut.`,
    `ManaMap's Modern creators span legacy grinders, brew enthusiasts, and tournament-prep specialists. Whether you need a sideboard guide before a Regional or want to understand why a given card is still legal, someone here has the answer.`,
  ],
  pauper: [
    `Pauper is Magic on a budget — a format restricted to commons, with a surprisingly deep card pool and a metagame that rewards lateral thinking over raw card power. No mythics required.`,
    `The Pauper creator community punches well above its weight. These creators publish more useful content per dollar of deck value than any other format community on ManaMap. Find your next $30 list below.`,
  ],
  pioneer: [
    `Pioneer occupies the sweet spot between Standard's rotating freshness and Modern's power ceiling. With a no-proxy tournament scene and an accessible card pool, it's the format players return to after rotating out of Standard.`,
    `ManaMap's Pioneer creators cover everything from FNM prep to Regional Championship theory. They're the people who figure out what's broken before the rest of the world catches on.`,
  ],
  legacy: [
    `Legacy is powered Magic with a century of card history. The format rewards efficiency above everything — zero-mana spells, pitch counters, and engines that generate value before your opponent has played their second land.`,
    `The Legacy creator community is experienced and uncompromising. Expect deep dives, historical context, and format knowledge that only comes from years of shuffling Force of Will.`,
  ],
  vintage: [
    `Vintage is Magic with the Power Nine on the table: Black Lotus, the Moxen, and a restricted list that reads like a museum catalog. The format for players who want to see what the game looks like with no guardrails.`,
    `Vintage creators are a rare breed. They hold the format's institutional knowledge, track which restricted cards are underplayed, and explain why Bazaar of Baghdad has never been fair.`,
  ],
  limited: [
    `Draft and Sealed are where Magic is arguably at its most skill-intensive. With no sideboard preparation possible and card evaluation changing every set, limited rewards adaptability over matchup knowledge.`,
    `ManaMap's limited creators publish set reviews, draft archetype breakdowns, and the pick signals that separate a winning draft from a pile of mediocre cards. Find a guide before your next prerelease.`,
  ],
  standard: [
    `Standard is Magic's entry format: a rotating card pool that refreshes the metagame each fall and underpins most game stores' weekly events. New sets matter here more than anywhere else.`,
    `Standard creators move fast. The best ones have their set review published before prerelease weekend and their metagame update ready the Monday after a large event. Find them here and never fall behind the meta.`,
  ],
  other: [
    `Magic contains multitudes: Oathbreaker, Brawl, Premodern, and a dozen community formats that fit between the cracks of the major categories. These creators cover the formats that don't always get a spotlight.`,
    `From cube enthusiasts to Peasant players, ManaMap's Other category is home to the most experimental voices in the game. If your preferred format doesn't have a dedicated page yet, you'll find its creators here.`,
  ],
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const format = await db.query.formatTags.findFirst({
    where: eq(formatTags.code, code as typeof formatTags.code._.data),
    columns: { name: true },
  })
  if (!format) return { title: 'Format not found' }

  const title = `Best ${format.name} Creators — ManaMap`
  const description = `Discover the top ${format.name} Magic: The Gathering content creators. Browse ${format.name} gameplay, deck techs, strategy guides, and tournament coverage.`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/format/${code}` },
    openGraph: { title, description, url: `/format/${code}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FormatPage({ params }: Props) {
  const { code } = await params

  const [format, allFormats] = await Promise.all([
    db.query.formatTags.findFirst({
      where: eq(formatTags.code, code as typeof formatTags.code._.data),
    }),
    db.query.formatTags.findMany({ orderBy: (f, { asc }) => [asc(f.name)] }),
  ])
  if (!format) notFound()

  const creators = await db.query.creatorProfiles.findMany({
    where: sql`EXISTS (
      SELECT 1 FROM creator_formats cf
      INNER JOIN format_tags ft ON cf.format_id = ft.id
      WHERE cf.creator_id = ${creatorProfiles.id}
      AND ft.code::text = ${code}
    )`,
    with: {
      primaryFormat: { columns: { colors: true } },
      contentTags: { with: { tag: { columns: { label: true } } } },
    },
    orderBy: [desc(creatorProfiles.followersTotal)],
    limit: 20,
  })

  const [p1, p2] = COPY[code] ?? [
    `${format.name} is one of Magic: The Gathering's most played formats, with a dedicated creator community producing gameplay, strategy, and educational content every week.`,
    `ManaMap tracks every ${format.name} creator publishing content today. Browse the list below to find the voices that match your playstyle and level.`,
  ]

  const related = allFormats.filter((f) => f.code !== code)

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
        <Eyebrow style={{ marginBottom: 16 }}>Format</Eyebrow>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.04,
            letterSpacing: '-0.025em',
            fontWeight: 400,
            margin: '0 0 28px',
            maxWidth: '20ch',
          }}
        >
          The best{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>{format.name}</em>{' '}
          creators
        </h1>

        <div style={{ maxWidth: '62ch', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{p1}</p>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{p2}</p>
        </div>

        <a href={`/search?formats=${code}`} style={ctaLink}>
          Filter + search all {format.name} creators →
        </a>
      </div>

      {/* ── Creator grid ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        {creators.length > 0 ? (
          <>
            <p style={countLabel}>{creators.length} creator{creators.length !== 1 ? 's' : ''}</p>
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
          <p style={emptyLabel}>No creators listed for this format yet.</p>
        )}
      </div>

      {/* ── Related formats ───────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 64px', borderTop: '1px solid var(--hairline)', paddingTop: 32 }}>
        <p style={alsoSeeLabel}>Also see:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {related.map((f) => (
            <a key={f.code} href={`/format/${f.code}`} style={{ textDecoration: 'none' }}>
              <Chip>{f.name}</Chip>
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

// ── Shared style constants ────────────────────────────────────────────────────

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
