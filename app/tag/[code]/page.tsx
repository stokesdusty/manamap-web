import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { contentTags, creatorProfiles } from '@/db/schema'
import { CreatorTile } from '@/components/ui/CreatorTile'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'

export const revalidate = 3600

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const rows = await db.query.contentTags.findMany({ columns: { code: true } })
  return rows.map((r) => ({ code: r.code }))
}

// ── Editorial copy (placeholder — edit in place) ──────────────────────────────

const COPY: Partial<Record<string, readonly [string, string]>> = {
  budget: [
    `Budget Magic is the great equalizer. These creators have proven, format after format, that tight card selection and deep format knowledge matter more than a foiled-out list. Competitive doesn't have to mean expensive.`,
    `ManaMap's budget creator community is the most practically useful segment in the directory. If you're building a new deck for under $100, or trying to upgrade an existing list without breaking the bank, start here.`,
  ],
  brewing: [
    `Brewers are the format's R&D department. They find the synergies that tournament players miss, build the janky decks that occasionally go 5-0 on MTGO, and ask "what if?" with every new set spoiler.`,
    `The brewing community on ManaMap skews creative and experimental. These aren't people chasing the tier-one list — they're searching for the deck nobody else has figured out yet. Follow a few and let them shape your next build.`,
  ],
  competitive: [
    `Competitive Magic is preparation and pattern recognition at scale. Knowing the metagame isn't enough — you need to know your opponents' lines, your own percentage plays, and the correct sideboard calls before you sit down.`,
    `These creators have done the work. They play hundreds of competitive matches per year, analyze results obsessively, and share conclusions in the kind of detail that moves your win rate. Follow the tournament grinders.`,
  ],
  analytical: [
    `Analytical Magic content is data over gut feel. These creators run the numbers — win rates, mana curve analyses, card advantage counts, and mulligan decisions treated as probability problems rather than vibes.`,
    `If you want to understand why a card is played rather than just that it's played, you want the analytical community. Find creators who explain their reasoning, publish data from their matches, and update their models as the meta shifts.`,
  ],
  comedy: [
    `Comedy Magic content proves the game is as funny as it is deep. Misplays, table politics gone sideways, and the eternal comedy of shuffling 100-card decks — these creators capture the culture at its most human.`,
    `ManaMap's comedy creators aren't just entertainers — they're often some of the sharpest observers of what makes Magic culture tick. Follow a few and rediscover why you started playing in the first place.`,
  ],
  casual: [
    `Casual Magic is for players who love the game without making it a job. These creators build for fun over optimization, prioritize table experience over win rates, and remember that the point of the game is to enjoy it.`,
    `The casual community is Magic's largest and most welcoming segment. If you want to enjoy the game at FNM, at your kitchen table, or at a new game store, ManaMap's casual creators will show you how.`,
  ],
  beginner: [
    `Learning Magic properly is one of the best investments a new player can make. The gap between "knowing the rules" and "understanding the game" is enormous, and the right teacher can close it in a fraction of the time.`,
    `ManaMap's beginner-friendly creators specialize in making that transition painless. Patient explanations, budget starter lists, and format breakdowns designed for people who just cracked their first booster — find them here.`,
  ],
  spike: [
    `Spike plays to win. Every card choice is a percentage calculation. Every sideboard slot is earned through matchup analysis. Every game is a data point. If you're playing to top eight, not to have fun, you're in the right place.`,
    `ManaMap's Spike creators are the most results-focused voices in the directory. They care about win rate, not narrative. They care about correct play, not dramatic play. Follow them when it's time to stop losing.`,
  ],
  timmy: [
    `Timmy wants big effects, epic plays, and the moment when a 20/20 attacks for the win. These creators celebrate the scale of Magic — the dragons, the game-winning combos, the board states that take over a table.`,
    `Find creators who love the game's spectacle: massive Commander turns, Timmy's dream of "going big" realized in every format willing to let you untap with a 10-mana spell on the stack.`,
  ],
  vorthos: [
    `Vorthos cares about the story — the lore, the art, the flavor text, the worlds behind the cards. Magic is a game, but it's also a three-decade science-fantasy saga, and Vorthos has read every chapter.`,
    `ManaMap's Vorthos creators bridge game and story. Find people who explain why the art on a dual land matters, what happened on Mirrodin before it became New Phyrexia, and why flavor text is the best game design tool in history.`,
  ],
  tournament: [
    `Tournament coverage is how most players experience competitive Magic they can't attend in person. These creators are at the tables, in the feature match area, and in the halls interviewing the players you want to know.`,
    `ManaMap's tournament creators are the journalists and commentators of the Magic world. Follow them for live coverage, post-event analysis, and the access that used to require a judge badge to get.`,
  ],
  reanimator: [
    `Reanimator decks break the fundamental rule of Magic: if a card costs too much to cast, put it in the graveyard and cheat it into play. Entomb, Animate Dead, and twenty years of broken interactions later, the archetype is still thriving.`,
    `These creators specialize in the graveyard as a resource — the sequencing decisions, the must-counter threats, and the hate cards your opponent absolutely needs to draw. Find the Reanimator specialists on ManaMap.`,
  ],
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const tag = await db.query.contentTags.findFirst({
    where: eq(contentTags.code, code),
    columns: { label: true, kind: true },
  })
  if (!tag) return { title: 'Tag not found' }

  const title = `${tag.label} MTG Creators — ManaMap`
  const description = `Find Magic: The Gathering creators focused on ${tag.label.toLowerCase()} content. Browse ${tag.label.toLowerCase()} deck techs, gameplay, strategy, and more.`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/tag/${code}` },
    openGraph: { title, description, url: `/tag/${code}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TagPage({ params }: Props) {
  const { code } = await params

  const [tag, allTags] = await Promise.all([
    db.query.contentTags.findFirst({ where: eq(contentTags.code, code) }),
    db.query.contentTags.findMany({ orderBy: (t, { asc }) => [asc(t.label)] }),
  ])
  if (!tag) notFound()

  const creators = await db.query.creatorProfiles.findMany({
    where: sql`EXISTS (
      SELECT 1 FROM creator_content_tags cct
      INNER JOIN content_tags ct ON cct.tag_id = ct.id
      WHERE cct.creator_id = ${creatorProfiles.id}
      AND ct.code = ${code}
    )`,
    with: {
      primaryFormat: { columns: { colors: true } },
      contentTags: { with: { tag: { columns: { label: true } } } },
    },
    orderBy: [desc(creatorProfiles.followersTotal)],
    limit: 20,
  })

  const kindLabel =
    tag.kind === 'style' ? 'Content style' : tag.kind === 'audience' ? 'Audience' : 'Theme'

  const [p1, p2] = COPY[code] ?? [
    `${tag.label} is one of the most popular content styles in the Magic: The Gathering creator community, with a dedicated group of creators publishing gameplay, strategy, and educational content every week.`,
    `ManaMap tracks every creator tagged with ${tag.label} today. Browse the list below to find the voices that match your interests and playstyle.`,
  ]

  // Related: other tags of the same kind
  const related = allTags.filter((t) => t.kind === tag.kind && t.code !== code)
  // Cross-kind suggestions (2 each from other kinds)
  const crossKind = allTags.filter((t) => t.kind !== tag.kind).slice(0, 4)

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
        <Eyebrow style={{ marginBottom: 16 }}>{kindLabel}</Eyebrow>
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
          <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>{tag.label}</em>{' '}
          Magic: The Gathering creators
        </h1>

        <div style={{ maxWidth: '62ch', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{p1}</p>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0 }}>{p2}</p>
        </div>

        <a href={`/search?tags=${code}`} style={ctaLink}>
          Filter + search all {tag.label} creators →
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
          <p style={emptyLabel}>No creators tagged with this style yet.</p>
        )}
      </div>

      {/* ── Related tags ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 64px', borderTop: '1px solid var(--hairline)', paddingTop: 32 }}>
        <p style={alsoSeeLabel}>Also see:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {related.map((t) => (
            <a key={t.code} href={`/tag/${t.code}`} style={{ textDecoration: 'none' }}>
              <Chip>{t.label}</Chip>
            </a>
          ))}
          {crossKind.map((t) => (
            <a key={t.code} href={`/tag/${t.code}`} style={{ textDecoration: 'none' }}>
              <Chip>{t.label}</Chip>
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
