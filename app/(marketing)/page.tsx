import type { Metadata } from 'next'
import { Show, UserButton } from '@clerk/nextjs'
import { SignupForm } from './_components/SignupForm'
import { Pip } from '@/components/ui/Pip'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: { absolute: 'ManaMap — The directory for MTG creators' },
  description:
    'ManaMap is the discovery and infrastructure layer for the MTG creator ecosystem. Find creators by format, content style, audience, and region — then see where they\'re streaming, posting, and showing up next.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ManaMap — The directory for MTG creators',
    description: 'Search 1,400+ creators by format, content style, audience, and region.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ManaMap — The directory for MTG creators',
    description: 'Search 1,400+ creators by format, content style, audience, and region.',
  },
}

// ── Constants ─────────────────────────────────────────────────────────────────

const W = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' } as const

const WUBRG = [
  { c: 'w' as const, bg: 'var(--w)' },
  { c: 'u' as const, bg: 'var(--u)' },
  { c: 'b' as const, bg: 'var(--b)' },
  { c: 'r' as const, bg: 'var(--r)' },
  { c: 'g' as const, bg: 'var(--g)' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const launched = process.env.NEXT_PUBLIC_LAUNCHED === 'true'
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)' }}>
      {!launched && <ComingSoonBanner />}
      <LandingNav launched={launched} />
      <Hero />
      <Quote />
      <Shot1 />
      <Pillars />
      <Shot2 />
      <WhoFor />
      <Shot3 />
      <Manifesto />
      <Roadmap />
      <FinalCTA />
      <Footer />
    </div>
  )
}

// ── Pre-launch banner ─────────────────────────────────────────────────────────

function ComingSoonBanner() {
  return (
    <div
      style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        textAlign: 'center',
        padding: '10px 32px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      Coming soon — join the waitlist below and we'll email you when it's live.
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function LandingNav({ launched }: { launched: boolean }) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(245,241,232,0.86)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div
        style={{
          ...W,
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Wordmark />
        <div
          className="hide-md"
          style={{
            display: 'flex',
            gap: 28,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
          }}
        >
          {[
            ['#what', 'What it is'],
            ['#who', "Who it's for"],
            ['#how', 'How it works'],
            ['#roadmap', 'Roadmap'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Show when="signed-out">
            <a
              href={launched ? '/sign-in' : '/sign-up'}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-3)',
                textDecoration: 'none',
              }}
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--paper)',
                background: 'var(--ink)',
                padding: '6px 14px',
                borderRadius: 999,
                textDecoration: 'none',
              }}
            >
              Claim your profile →
            </a>
          </Show>
          <Show when="signed-in">
            <a
              href="/dashboard"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-3)',
                textDecoration: 'none',
              }}
            >
              Dashboard
            </a>
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <header
      style={{
        padding: '80px 0 64px',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div style={W}>
        {/* Status pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ink-3)',
            padding: '6px 14px',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 999,
            background: 'var(--surface)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--g)',
              boxShadow: '0 0 0 3px rgba(92,138,90,0.2)',
              display: 'inline-block',
            }}
          />
          Pre-launch · Summer 2026
        </div>

        {/* Hero grid */}
        <div className="rg-hero-grid">
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(48px, 7vw, 96px)',
                lineHeight: 0.98,
                letterSpacing: '-0.035em',
                fontWeight: 400,
                margin: '0 0 24px',
                maxWidth: '14ch',
              }}
            >
              The directory for{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>
                MTG creators.
              </em>
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                lineHeight: 1.4,
                color: 'var(--ink-2)',
                fontStyle: 'italic',
                maxWidth: '36ch',
                margin: '0 0 32px',
              }}
            >
              Search 1,400+ creators by format, content style, audience, and
              region. See where they're streaming, posting, and showing up next.
            </p>

            <SignupForm id="waitlist" source="hero" />

            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-3)',
              }}
            >
              <span>Or</span>
              <a
                href="/onboard"
                style={{
                  color: 'var(--ink-3)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--ink-4)',
                  paddingBottom: 1,
                }}
              >
                claim your creator handle →
              </a>
              <span style={{ color: 'var(--ink-5)' }}>·</span>
              <span>200 creators &amp; counting</span>
            </div>
          </div>

          {/* Meta stats card */}
          <aside
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: '18px 22px',
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
            }}
          >
            {[
              { l: 'Creators indexed',  v: '1,412'  },
              { l: 'Events tracked',    v: '38'     },
              { l: 'Stores onboarding', v: '14'     },
            ].map(({ l, v }, i) => (
              <div key={l}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 10,
                  }}
                >
                  <span style={{ color: 'var(--ink-4)' }}>{l}</span>
                  <strong
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 22,
                      letterSpacing: '-0.02em',
                      color: 'var(--ink)',
                      fontWeight: 400,
                      textTransform: 'none',
                    }}
                  >
                    {v}
                  </strong>
                </div>
                {i < 2 && (
                  <hr
                    style={{
                      border: 'none',
                      borderTop: '1px solid var(--hairline)',
                      margin: '14px 0 0',
                    }}
                  />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-4)' }}>Formats covered</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {WUBRG.map(({ c }) => <Pip key={c} color={c} size="sm" />)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </header>
  )
}

// ── Strategic quote ───────────────────────────────────────────────────────────

function Quote() {
  return (
    <section style={{ padding: '64px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={W}>
        <div className="rg-quote-grid">
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--ink-3)',
                margin: '0 0 6px',
              }}
            >
              The thesis
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-4)',
                margin: 0,
              }}
            >
              IMDb + LinkedIn + Bandsintown for MTG
            </p>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              color: 'var(--ink)',
              maxWidth: '22ch',
              margin: 0,
            }}
          >
            The MTG creator ecosystem is fragmented across ten platforms.{' '}
            <em>ManaMap is the connective tissue —</em> identity, discovery,
            and events in one place.
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Screenshot 1: Discovery ───────────────────────────────────────────────────

function Shot1() {
  return (
    <section
      id="what"
      style={{ padding: '96px 0', borderBottom: '1px solid var(--hairline)' }}
    >
      <div style={W}>
        <SectionHead
          eyebrow="01 · Discover"
          heading={<>A search-first front door. <em>No feed, no posts.</em></>}
          sub="Filter by color, format, content style, audience, region. Every combination is a sharable URL. Built to find people, not to host them."
        />

        <div style={{ position: 'relative', marginTop: 8 }}>
          <ShotTag pos="tl">Color-pie filter chips</ShotTag>
          <ShotTag pos="tr">Featured · trending · events</ShotTag>
          <Shot url="manamap.gg" figNum="FIG 01" figLabel="Discovery — manamap.gg">
            {/* Mock: homepage */}
            <div style={{ padding: '24px 28px', background: 'var(--paper)' }}>
              <MockNav />
              <MockHero />
              <MockSectionHead title="Featured this week" more="View all 1,412 →" />
              <MockFeaturedRow />
              <MockSectionHead title="Trending in EDH" more="More →" />
              <MockCreatorGrid />
            </div>
          </Shot>
        </div>
      </div>
    </section>
  )
}

// ── Three pillars ─────────────────────────────────────────────────────────────

function Pillars() {
  const PILLARS = [
    {
      n: '01 · Like IMDb',
      title: 'The directory',
      body: 'Structured search across every active MTG creator. Filter by format, color, content type, audience style, region, follower size. The first place fans look — and the first place a sponsor looks before signing a deal.',
      ref: '→ Discovery + recommendations',
    },
    {
      n: '02 · Like LinkedIn',
      title: 'The identity layer',
      body: 'One canonical profile per creator. Auto-syncs YouTube, Twitch, Bluesky, Moxfield. Bio, formats, decks, schedule, past appearances. Replaces the Linktree-plus-spreadsheet media kit with something real.',
      ref: '→ Profile + media kit',
    },
    {
      n: '03 · Like Bandsintown',
      title: 'The events layer',
      body: 'Conventions, RCQs, LGS nights, signings. Creators mark appearances; fans track events; stores discover creators to book. Local scenes get real surface area — Seattle first, then everywhere.',
      ref: '→ Events + store pages + booking',
    },
  ]

  return (
    <section style={{ padding: '96px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={W}>
        <SectionHead
          eyebrow="What it does"
          heading={<>Three layers, <em>one canonical surface.</em></>}
          sub="Existing platforms stay the content layer — YouTube, Twitch, Bluesky. ManaMap is the layer that organizes them."
        />

        <div
          className="rg-3col"
          style={{
            gap: 1,
            background: 'var(--hairline)',
            border: '1px solid var(--hairline)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.n}
              style={{
                background: 'var(--surface)',
                padding: '36px 32px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 260,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-4)',
                }}
              >
                {p.n}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 28,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                {p.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
                {p.body}
              </p>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-4)',
                  marginTop: 'auto',
                }}
              >
                {p.ref}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Screenshot 2: Creator profile ─────────────────────────────────────────────

function Shot2() {
  return (
    <section style={{ padding: '96px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={W}>
        <SectionHead
          eyebrow="02 · Identity"
          heading={<>One profile. <em>Every platform.</em></>}
          sub={
            <>
              A canonical page at{' '}
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  background: 'var(--paper-soft)',
                  border: '1px solid var(--hairline)',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                manamap.gg/c/[handle]
              </code>{' '}
              — auto-aggregating your YouTube uploads, Twitch status, Bluesky posts, Moxfield decks, and upcoming appearances.
            </>
          }
        />

        <div style={{ position: 'relative' }}>
          <ShotTag pos="tl">Structured tags</ShotTag>
          <ShotTag pos="tr">Cross-platform aggregation</ShotTag>
          <ShotTag pos="bl">Event sidebar</ShotTag>
          <Shot url="manamap.gg/c/lyra-vance" figNum="FIG 02" figLabel="Creator profile — manamap.gg/c/[handle]">
            <MockProfile />
          </Shot>
        </div>
      </div>
    </section>
  )
}

// ── Who it's for ──────────────────────────────────────────────────────────────

function WhoFor() {
  const WHO = [
    {
      lbl: 'For fans',
      color: 'var(--ink)',
      title: "Find the creators you didn't know existed.",
      body: "Filter by your format and your vibe. See who's streaming right now, who's at the convention you're going to, who's playing at the store down the street.",
      items: [
        { t: 'Search by format · color · region', v: 'FREE' },
        { t: 'Save creators & events',            v: 'FREE' },
        { t: 'Local scene pages',                 v: 'FREE' },
      ],
    },
    {
      lbl: 'For creators',
      color: 'var(--u)',
      title: 'Stop being invisible between uploads.',
      body: 'Claim your handle. Auto-sync every platform. Get found by sponsors and stores. Ship a real media kit in under 90 seconds. Free profile forever; paid tools when you need them.',
      items: [
        { t: 'Public profile + claim',  v: 'FREE'    },
        { t: 'Media kit + analytics',   v: '$9 / mo' },
        { t: 'Sponsorship inbox',       v: '$25 / mo'},
      ],
    },
    {
      lbl: 'For stores & events',
      color: 'var(--r)',
      title: 'Book the creators your community wants.',
      body: "List your events. Find local creators to invite. Reach fans tracking your region. Turn a Friday night RCQ into a draw — without buying ads on a platform that doesn't know what MTG is.",
      items: [
        { t: 'Store page + event calendar',     v: '$25 / mo'  },
        { t: 'Creator booking marketplace',     v: '$79 / mo'  },
        { t: 'Multi-location · API',            v: '$200 / mo' },
      ],
    },
  ]

  return (
    <section id="who" style={{ padding: '96px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={W}>
        <SectionHead
          eyebrow="Who it's for"
          heading={<>Fans free forever. <em>Creators &amp; stores pay.</em></>}
          sub="Discovery never gets paywalled. Monetization sits on the tools that creators, stores, and brands actually want to pay for — media kits, analytics, sponsored placement, booking."
        />

        <div className="rg-3col" style={{ gap: 32 }}>
          {WHO.map((w) => (
            <div key={w.lbl} style={{ borderTop: `2px solid ${w.color}`, paddingTop: 20 }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-3)',
                  margin: '0 0 8px',
                }}
              >
                {w.lbl}
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  fontWeight: 400,
                  margin: '0 0 12px',
                }}
              >
                {w.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '32ch' }}>
                {w.body}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '16px 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {w.items.map((item) => (
                  <li
                    key={item.t}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: '1px solid var(--hairline)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--ink-3)',
                    }}
                  >
                    <span>{item.t}</span>
                    <span style={{ color: 'var(--ink-4)' }}>{item.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Screenshot 3: Event page (dark) ──────────────────────────────────────────

function Shot3() {
  return (
    <section
      id="how"
      style={{
        padding: '96px 0',
        background: 'var(--ink)',
        color: 'var(--paper)',
      }}
    >
      <div style={W}>
        <SectionHead
          eyebrow="03 · Events"
          heading={<>Conventions, RCQs, local nights — <em>all on a calendar.</em></>}
          sub="Creators mark appearances; fans track events; stores discover talent to book. The events layer is how local scenes become legible — and how Seattle becomes the pilot for everywhere else."
          dark
        />

        <div style={{ position: 'relative' }}>
          <ShotTag pos="tl" dark>Creator appearances</ShotTag>
          <ShotTag pos="tr" dark>Schedule integration</ShotTag>
          <Shot
            url="manamap.gg/event/magiccon-vegas-2026"
            figNum="FIG 03"
            figLabel="Event — manamap.gg/event/[slug]"
            dark
          >
            <MockEvent />
          </Shot>
        </div>
      </div>
    </section>
  )
}

// ── Manifesto ─────────────────────────────────────────────────────────────────

function Manifesto() {
  const CELLS = [
    { n: '01', title: 'Directory, not feed.', body: 'No timeline. No algorithmic ranking by recency. No posting surface. Users come back when they have a job.' },
    { n: '02', title: 'Structured data first.', body: 'Every creator, event, and store has typed metadata. The directory is defensible because the schema is.' },
    { n: '03', title: 'Existing platforms are the content layer.', body: 'YouTube hosts the videos. Twitch hosts the streams. ManaMap deep-links — never replicates.' },
    { n: '04', title: 'Fans free forever.', body: 'Discovery never gets paywalled. Monetization sits on the tools creators, stores, and brands want.' },
    { n: '05', title: 'SEO is a first-class surface.', body: 'Every creator, tag, event, and region is a server-rendered page. Long-tail search is half the moat.' },
    { n: '06', title: 'Niche-first.', body: 'MTG only, for as long as it takes. Pokémon, Lorcana, FaB come later — never as a launch shortcut.' },
  ]

  return (
    <section
      style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: '64px 0 96px',
      }}
    >
      <div style={W}>
        <SectionHead eyebrow="Principles" heading={<>A tool, <em>not a feed.</em></>} dark />

        <div
          className="rg-2col"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {CELLS.map((cell, i) => (
            <div
              key={cell.n}
              style={{
                padding: '32px 0',
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                paddingRight: i % 2 === 0 ? 32 : 0,
                paddingLeft: i % 2 === 1 ? 32 : 0,
                borderTop: i >= 2 ? '1px solid rgba(255,255,255,0.12)' : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-5)',
                }}
              >
                {cell.n}
              </span>
              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 22,
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                  fontWeight: 400,
                  margin: '8px 0',
                  color: 'var(--paper)',
                }}
              >
                {cell.title}
              </h4>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-5)', margin: 0, maxWidth: '38ch' }}>
                {cell.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Mini roadmap ──────────────────────────────────────────────────────────────

function Roadmap() {
  const PHASES = [
    { n: 'Phase 0 · NOW',  title: 'Validation', body: 'Interviews · waitlist · seeding profiles', now: true  },
    { n: 'Phase 1 · Aug 26', title: 'MVP',       body: 'Profiles · search · filters',             now: false },
    { n: 'Phase 2 · Q4 26',  title: 'Discovery', body: 'Recs · auto-import · trending',           now: false },
    { n: 'Phase 3 · Q1 27',  title: 'Events',    body: 'Conventions · stores · local',            now: false },
    { n: 'Phase 4 · Q2 27',  title: 'Monetize',  body: 'Creator pro · store SaaS',                now: false },
    { n: 'Phase 5 · 27+',    title: 'Marketplace', body: 'Booking · sponsorship · expansion',     now: false },
  ]

  return (
    <section id="roadmap" style={{ padding: '96px 0', borderBottom: '1px solid var(--hairline)' }}>
      <div style={W}>
        <SectionHead
          eyebrow="Where we are"
          heading={<>Shipping in <em>phases.</em></>}
          sub="No big launch. Onboard quietly, build the directory under-the-radar, then announce when the data is the moat."
        />

        <div
          className="rg-roadmap"
          style={{ gap: 1, background: 'var(--hairline)', border: '1px solid var(--hairline)' }}
        >
          {PHASES.map((p) => (
            <div
              key={p.n}
              style={{
                background: p.now ? 'var(--ink)' : 'var(--surface)',
                color: p.now ? 'var(--paper)' : 'var(--ink)',
                padding: '20px 18px',
                minHeight: 140,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: p.now ? 'var(--ink-5)' : 'var(--ink-4)',
                  margin: '0 0 4px',
                }}
              >
                {p.n}
              </p>
              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  letterSpacing: '-0.01em',
                  fontWeight: 400,
                  margin: '0 0 6px',
                  color: p.now ? 'var(--paper)' : 'var(--ink)',
                }}
              >
                {p.title}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: p.now ? 'var(--ink-5)' : 'var(--ink-3)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section style={{ textAlign: 'center', padding: '120px 32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(48px, 6vw, 80px)',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            fontWeight: 400,
            fontStyle: 'italic',
            margin: '0 0 24px',
          }}
        >
          Be there at <span style={{ fontStyle: 'normal' }}>turn one.</span>
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            lineHeight: 1.45,
            color: 'var(--ink-2)',
            margin: '0 auto 36px',
            maxWidth: '40ch',
          }}
        >
          Join the waitlist. We'll email you when the MVP is open, and earlier if
          you tell us you're a creator who'd claim a profile.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <SignupForm source="final_cta" />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
          }}
        >
          <span>Or</span>
          <a
            href="/onboard"
            style={{
              color: 'var(--ink-3)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--ink-4)',
              paddingBottom: 1,
            }}
          >
            claim your creator handle →
          </a>
          <span style={{ color: 'var(--ink-5)' }}>·</span>
          <span>200 creators &amp; counting</span>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const COLS = [
    {
      heading: null,
      brand: true,
      links: [],
    },
    {
      heading: 'Product',
      brand: false,
      links: [
        { label: 'Discover', href: '#what' },
        { label: 'Profiles', href: '/search' },
        { label: 'Events',   href: '#how'  },
        { label: 'Stores',   href: '/store/mox-bellevue' },
      ],
    },
    {
      heading: 'Company',
      brand: false,
      links: [
        { label: 'About',    href: '#' },
        { label: 'Roadmap',  href: '#roadmap' },
        { label: 'Press',    href: '#' },
        { label: 'Contact',  href: '#' },
      ],
    },
    {
      heading: 'Connect',
      brand: false,
      links: [
        { label: 'Bluesky',    href: '#' },
        { label: 'YouTube',    href: '#' },
        { label: 'Newsletter', href: '#waitlist' },
        { label: 'RSS',        href: '#' },
      ],
    },
  ]

  return (
    <footer style={{ padding: '48px 0 56px', borderTop: '1px solid var(--hairline)' }}>
      <div style={W}>
        <div
          className="rg-footer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
          }}
        >
          {COLS.map((col, i) => (
            <div key={i}>
              {col.brand ? (
                <>
                  <Wordmark size={18} />
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      margin: '8px 0 0',
                    }}
                  >
                    The directory for MTG creators.
                  </p>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--ink)',
                      margin: '0 0 14px',
                    }}
                  >
                    {col.heading}
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          style={{
                            color: 'var(--ink-3)',
                            textDecoration: 'none',
                          }}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer meta */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid var(--hairline)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-4)',
          }}
        >
          <span>© 2026 ManaMap · Not affiliated with Wizards of the Coast.</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {WUBRG.map(({ c }) => <Pip key={c} color={c} size="sm" />)}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <a
      href="/"
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: size,
        letterSpacing: '-0.02em',
        textDecoration: 'none',
        color: 'var(--ink)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      Mana
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          background: 'var(--w)',
          borderRadius: '50%',
          margin: '0 1px',
        }}
      />
      <em style={{ fontStyle: 'italic' }}>Map</em>
    </a>
  )
}

function SectionHead({
  eyebrow,
  heading,
  sub,
  dark = false,
}: {
  eyebrow: string
  heading: React.ReactNode
  sub?: React.ReactNode
  dark?: boolean
}) {
  return (
    <div className="rg-sectionhead">
      <div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: dark ? 'var(--ink-5)' : 'var(--ink-3)',
            margin: 0,
          }}
        >
          {eyebrow}
        </p>
      </div>
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4.5vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            fontWeight: 400,
            margin: '0',
            color: dark ? 'var(--paper)' : 'var(--ink)',
            maxWidth: '22ch',
          }}
        >
          {heading}
        </h2>
        {sub && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              lineHeight: 1.45,
              color: dark ? 'var(--ink-5)' : 'var(--ink-2)',
              margin: '16px 0 0',
              maxWidth: '50ch',
              fontStyle: 'italic',
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

function Shot({
  url,
  figNum,
  figLabel,
  dark = false,
  children,
}: {
  url: string
  figNum: string
  figLabel: string
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <div
        style={{
          border: '1px solid var(--hairline-strong)',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'var(--surface)',
          boxShadow: dark
            ? '0 1px 0 rgba(0,0,0,0.4), 0 40px 80px -25px rgba(0,0,0,0.5)'
            : '0 1px 0 rgba(0,0,0,0.02), 0 30px 60px -25px rgba(26,24,19,0.2), 0 60px 120px -50px rgba(26,24,19,0.15)',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: 'var(--paper-soft)',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--hairline-strong)',
                  display: 'block',
                }}
              />
            ))}
          </div>
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-3)',
              background: 'var(--paper)',
              border: '1px solid var(--hairline)',
              borderRadius: 5,
              padding: '4px 10px',
            }}
          >
            {url}
          </span>
        </div>
        {/* Canvas */}
        <div style={{ background: 'var(--paper)', color: 'var(--ink)' }}>{children}</div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: dark ? 'var(--ink-5)' : 'var(--ink-4)',
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
          }}
        >
          {figNum}
        </span>
        {figLabel}
      </div>
    </>
  )
}

function ShotTag({
  pos,
  dark = false,
  children,
}: {
  pos: 'tl' | 'tr' | 'bl' | 'br'
  dark?: boolean
  children: React.ReactNode
}) {
  const posStyles: Record<string, React.CSSProperties> = {
    tl: { top: -12,  left: 24  },
    tr: { top: -12,  right: 24 },
    bl: { bottom: -12, left: 24 },
    br: { bottom: -12, right: 24},
  }
  return (
    <span
      style={{
        position: 'absolute',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: dark ? 'var(--ink-5)' : 'var(--ink-3)',
        background: dark ? 'var(--ink)' : 'var(--paper)',
        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--hairline-strong)',
        padding: '4px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        zIndex: 3,
        ...posStyles[pos],
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dark ? 'var(--paper)' : 'var(--ink)',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  )
}

// ── Inline mock components (replaced by Playwright screenshots in Phase 2) ────

function MockNav() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 18,
        borderBottom: '1px solid var(--hairline)',
        marginBottom: 18,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        Mana
        <span style={{ width: 6, height: 6, background: 'var(--w)', borderRadius: '50%', display: 'inline-block', margin: '0 1px' }} />
        <em style={{ fontStyle: 'italic' }}>Map</em>
      </div>
      <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-3)' }}>
        {['Discover', 'Events', 'Stores', 'Formats'].map((l) => <span key={l}>{l}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <MockBtn ghost>Sign in</MockBtn>
        <MockBtn solid>Claim profile</MockBtn>
      </div>
    </div>
  )
}

function MockHero() {
  return (
    <div style={{ padding: '24px 0 20px', borderBottom: '1px solid var(--hairline)', marginBottom: 4 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: 8 }}>
        The directory for MTG creators
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.025em', fontWeight: 400, margin: '0 0 10px', maxWidth: '18ch' }}>
        Find the people behind the format you love.
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: '50ch', marginBottom: 14 }}>
        Search 1,412 creators by format, content style, audience, and region.
      </p>
      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--hairline-strong)', borderRadius: 999, padding: '6px 6px 6px 18px', maxWidth: 480, gap: 10, marginBottom: 12 }}>
        <span style={{ flex: 1, fontSize: 12, color: 'var(--ink-4)' }}>Find a creator, format, or city…</span>
        <div style={{ display: 'flex', gap: 4, background: 'var(--paper-soft)', borderRadius: 999, padding: 4 }}>
          {['Creators', 'Events', 'Stores'].map((s, i) => (
            <span key={s} style={{ padding: '2px 8px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? 'var(--paper)' : 'var(--ink-3)' }}>{s}</span>
          ))}
        </div>
        <MockBtn solid style={{ fontSize: 11 }}>Search</MockBtn>
      </div>
      {/* Color rail */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)' }}>
        <span>Filter by color:</span>
        {WUBRG.map(({ c, bg }) => (
          <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', border: '1px solid var(--hairline)', borderRadius: 999, background: 'var(--surface)', color: 'var(--ink-3)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: bg, display: 'inline-block' }} />
            {c === 'w' ? 'White' : c === 'u' ? 'Blue' : c === 'b' ? 'Black' : c === 'r' ? 'Red' : 'Green'}
          </span>
        ))}
      </div>
    </div>
  )
}

function MockSectionHead({ title, more }: { title: string; more: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '20px 0 12px' }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '-0.01em', fontWeight: 400 }}>{title}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)' }}>{more}</span>
    </div>
  )
}

function MockFeaturedRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, marginBottom: 4 }}>
      {/* Featured hero card */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 10, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', minHeight: 180 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-5)', marginBottom: 4 }}>Creator of the week</span>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', margin: '4px 0' }}>Lyra Vance</div>
        <div style={{ fontSize: 11, color: 'var(--ink-5)', maxWidth: '28ch', lineHeight: 1.4 }}>Brewing budget Pauper decks at a pace nobody else can match. 47 builds in 2026, 0 above $35.</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--u)', display: 'inline-block' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--b)', display: 'inline-block' }} />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-5)' }}>
          <span>YT · 38k</span><span>TW · 4.2k</span>
        </div>
      </div>
      {/* Standard creator cards */}
      {[
        { name: 'Hauke Ostmann', handle: '@hauke · Hamburg',  colors: ['var(--r)', 'var(--g)'], tags: ['cEDH', 'Tournament'], yt: '22k', tw: '6.1k' },
        { name: 'Nadia Ruiz',    handle: '@nadiabrews · CDMX', colors: ['var(--w)', 'var(--u)', 'var(--b)'], tags: ['EDH', 'Comedy'], yt: '91k', tt: '120k' },
      ].map((c) => (
        <div key={c.name} style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 72, background: 'repeating-linear-gradient(45deg, var(--paper-soft) 0 6px, var(--paper) 6px 12px)', position: 'relative', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, display: 'flex' }}>
              {c.colors.map((bg, i) => <span key={i} style={{ flex: 1, background: bg }} />)}
            </div>
          </div>
          <div style={{ padding: '10px 12px', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, letterSpacing: '-0.01em' }}>{c.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{c.handle}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {c.tags.map(t => <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--paper-soft)', padding: '2px 5px', borderRadius: 3, color: 'var(--ink-3)' }}>{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderTop: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>
            <span>YT <strong style={{ color: 'var(--ink)' }}>{c.yt}</strong></span>
            {(c.tw || c.tt) && <span>{c.tw ? 'TW' : 'TT'} <strong style={{ color: 'var(--ink)' }}>{c.tw ?? c.tt}</strong></span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function MockCreatorGrid() {
  const CREATORS = [
    { name: 'Mara Okwu',   handle: '@stomp · Lagos',          colors: ['var(--g)'],                       tag: 'Budget'    },
    { name: 'Theo Park',   handle: '@izzetbrew · Seoul',       colors: ['var(--u)', 'var(--r)'],           tag: 'Brewing'   },
    { name: 'Eli Bramer',  handle: '@selesnyaboy · Boston',    colors: ['var(--w)', 'var(--g)'],           tag: 'Casual'    },
    { name: 'Sage Demir',  handle: '@rakdosqueen · Istanbul',  colors: ['var(--b)', 'var(--r)'],           tag: 'Reanimator'},
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
      {CREATORS.map((c) => (
        <div key={c.name} style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: 56, background: 'repeating-linear-gradient(45deg, var(--paper-soft) 0 6px, var(--paper) 6px 12px)', position: 'relative', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, display: 'flex' }}>
              {c.colors.map((bg, i) => <span key={i} style={{ flex: 1, background: bg }} />)}
            </div>
          </div>
          <div style={{ padding: '8px 10px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, letterSpacing: '-0.01em' }}>{c.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 2 }}>{c.handle}</div>
            <span style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--paper-soft)', padding: '2px 5px', borderRadius: 3, color: 'var(--ink-3)', marginTop: 5 }}>{c.tag}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MockProfile() {
  return (
    <div>
      {/* Profile hero */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, var(--paper) 0 12%, var(--paper-soft) 12% 60%, var(--hairline) 60%)', border: '2px solid var(--surface)', boxShadow: '0 0 0 1px var(--hairline)', flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1px dashed var(--hairline-strong)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, letterSpacing: '-0.025em', margin: '0 0 2px' }}>Lyra Vance</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>@lyrabrews · Portland, OR · Pacific Time</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
              {[['38.2k', 'YouTube'], ['4.2k', 'Twitch'], ['12.7k', 'Bluesky']].map(([n, p]) => (
                <span key={p}><strong style={{ color: 'var(--ink)' }}>{n}</strong> on {p}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <MockBtn>Save</MockBtn>
            <MockBtn solid>Follow</MockBtn>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: '0 0 12px', maxWidth: '55ch' }}>Pauper brewer, occasional Modern dabbler. Building decks that are good <em>and</em> cheap. Tuesdays + Fridays on YouTube, Thursday nights on Twitch.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {[{ l: 'Pauper', solid: true }, { l: 'Modern' }, { l: 'Brewing' }, { l: 'Budget' }, { l: 'Beginner-friendly' }, { l: 'Analytical' }].map(({ l, solid }) => (
            <span key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', background: solid ? 'var(--ink)' : 'var(--paper-soft)', border: `1px solid ${solid ? 'var(--ink)' : 'var(--hairline)'}`, borderRadius: 3, padding: '2px 7px', color: solid ? 'var(--paper)' : 'var(--ink-3)' }}>{l}</span>
          ))}
        </div>
      </div>
      {/* Profile body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, padding: '18px 22px' }}>
        <div>
          <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--hairline)', marginBottom: 14, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {['Content', 'Decks', 'Events', 'About'].map((t, i) => (
              <span key={t} style={{ padding: '6px 0', color: i === 0 ? 'var(--ink)' : 'var(--ink-4)', borderBottom: `2px solid ${i === 0 ? 'var(--ink)' : 'transparent'}`, marginBottom: -1 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { platform: 'YouTube', title: 'Brewing $30 Dimir Faeries for the new meta', sub: '2 days ago · 14:22 · 18.4k views' },
              { platform: 'Twitch', title: 'VOD: Pauper challenge — 5 events, 1 deck', sub: '5 days ago · 3h 12m' },
            ].map((c) => (
              <div key={c.title} style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 7, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--paper-soft) 0%, var(--paper) 100%)', position: 'relative', borderBottom: '1px solid var(--hairline)' }}>
                  <span style={{ position: 'absolute', top: 6, left: 6, fontFamily: 'var(--font-mono)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--surface)', padding: '2px 5px', borderRadius: 3, color: 'var(--ink-3)' }}>{c.platform}</span>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, lineHeight: 1.3, color: 'var(--ink)', marginBottom: 3 }}>{c.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-4)' }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Side rail */}
        <aside style={{ fontSize: 12 }}>
          {[
            { h: 'Platforms', items: [['YouTube', '38.2k'], ['Twitch', '4.2k'], ['Bluesky', '12.7k']] },
            { h: 'Upcoming', items: [['MagicCon Vegas', 'Jun 14'], ['Pauper Pop-up · PDX', 'Jul 02']] },
          ].map(({ h, items }) => (
            <div key={h} style={{ borderTop: '1px solid var(--hairline)', paddingTop: 12, marginTop: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 7, fontWeight: 500 }}>{h}</div>
              {items.map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', padding: '4px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <span>{l}</span>
                  <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</strong>
                </div>
              ))}
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}

function MockEvent() {
  return (
    <div>
      {/* Event hero — dark */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '24px 22px 20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-5)', marginBottom: 4 }}>Convention · Jun 12 — Jun 15, 2026</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-0.025em', fontWeight: 400, margin: '4px 0 8px', color: 'var(--paper)', lineHeight: 1.1 }}>MagicCon Vegas 2026</h2>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-5)' }}>
          <span>Las Vegas Convention Center</span><span>· 4 days</span><span>· 38 creators attending</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <MockBtn solid>Track this event</MockBtn>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--ink-5)', color: 'var(--paper)', background: 'transparent', cursor: 'pointer' }}>Add my appearance</span>
        </div>
      </div>
      {/* Event body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, padding: '18px 22px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 10, fontWeight: 500 }}>Creators attending</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {[['Lyra Vance', 'Panelist'], ['Hauke O.', 'Booth'], ['Nadia Ruiz', 'Signing'], ['Theo Park', 'Attending'], ['Eli Bramer', 'Coverage'], ['Sage Demir', 'Attending']].map(([n, r]) => (
              <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 7, padding: '8px 10px', display: 'flex', gap: 7, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--paper-soft)', border: '1px solid var(--hairline)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12, letterSpacing: '-0.01em' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}>{r}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 6, fontWeight: 500 }}>Schedule</div>
          {[
            { t: 'FRI 10:00', ti: 'Pauper meet-up · w/ Lyra Vance & @hauke', l: 'Booth 312' },
            { t: 'FRI 14:00', ti: 'Nadia Ruiz signing', l: 'Booth 118' },
            { t: 'SAT 11:30', ti: 'EDH brewing panel · 4 creators', l: 'Stage A' },
          ].map((row) => (
            <div key={row.t} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px', gap: 10, padding: '8px 0', borderTop: '1px solid var(--hairline)', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{row.t}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, letterSpacing: '-0.01em' }}>{row.ti}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', textAlign: 'right' }}>{row.l}</span>
            </div>
          ))}
        </div>
        <aside style={{ fontSize: 11 }}>
          {[
            { h: 'Organizer', items: [['Wizards Events', 'Verified']] },
            { h: 'Tracked by',  items: [['1,402 fans', '']] },
          ].map(({ h, items }) => (
            <div key={h} style={{ borderTop: '1px solid var(--hairline)', paddingTop: 10, marginTop: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 6, fontWeight: 500 }}>{h}</div>
              {items.map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', padding: '4px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <span>{l}</span>
                  {v && <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</strong>}
                </div>
              ))}
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}

function MockBtn({
  solid,
  ghost,
  children,
  style,
}: {
  solid?: boolean
  ghost?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        padding: '5px 12px',
        borderRadius: 999,
        border: ghost ? 'none' : `1px solid ${solid ? 'var(--ink)' : 'var(--hairline-strong)'}`,
        background: solid ? 'var(--ink)' : ghost ? 'transparent' : 'var(--surface)',
        color: solid ? 'var(--paper)' : 'var(--ink)',
        cursor: 'pointer',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
