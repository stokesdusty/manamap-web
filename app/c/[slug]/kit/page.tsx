import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles } from '@/db/schema'
import { formatCount, PLATFORM_LABEL } from '@/lib/format'
import { Pip } from '@/components/ui/Pip'

export const revalidate = 3600

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.slug, slug),
    columns: { displayName: true },
  })
  if (!creator) return { title: 'Media Kit not found' }

  return {
    title: `${creator.displayName} — Media Kit`,
    description: `Sponsor media kit for ${creator.displayName}. Cross-platform audience reach, content breakdown, and booking information.`,
    openGraph: {
      title: `${creator.displayName} Media Kit`,
      url: `/c/${slug}/kit`,
      type: 'profile',
    },
    alternates: { canonical: `/c/${slug}/kit` },
  }
}

// ── Static audience data (Phase 4: feed from real analytics) ─────────────────

const AUDIENCE_ROWS = [
  { k: 'Region',          v: '68% US · 14% EU · 8% LATAM' },
  { k: 'Player tenure',   v: 'Avg 5+ years'                },
  { k: 'Buying intent',   v: 'Mid · budget-aware'          },
] as const

const PARTNERSHIPS = [
  'TCGplayer · 3-video sponsorship · Q1 2026',
  'Card Kingdom · channel sponsor · 2025',
  'MTGgoldfish · podcast cross-promo',
] as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MediaKitPage({ params }: Props) {
  const { slug } = await params

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.slug, slug),
    with: {
      region: { columns: { name: true } },
      primaryFormat: { columns: { name: true, colors: true } },
      formats: { with: { format: { columns: { name: true } } } },
      contentTags: { with: { tag: { columns: { label: true } } } },
      socialAccounts: {
        columns: { platform: true, handle: true, url: true, followers: true },
        orderBy: (s, { desc }) => [desc(s.followers)],
      },
    },
  })
  if (!creator) notFound()

  // ── Derived metrics ───────────────────────────────────────────────────────

  const totalReach = creator.socialAccounts.reduce((sum, s) => sum + s.followers, 0)
  const platforms = creator.socialAccounts.map((s) => ({
    ...s,
    pct: totalReach > 0 ? Math.round((s.followers / totalReach) * 100) : 0,
  }))

  const colors = (creator.primaryFormat?.colors ?? []) as Array<'w' | 'u' | 'b' | 'r' | 'g'>
  const formatList = creator.formats.map((f) => f.format.name).join(' · ')
  const tagList = creator.contentTags.map((ct) => ct.tag.label).join(', ')

  const updatedLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const METRICS = [
    { n: formatCount(totalReach), l: 'Total reach' },
    { n: '8.4%',                  l: 'Avg engagement' },
    { n: '62k',                   l: 'Views / mo'     },
    { n: '3.2k',                  l: 'Comments / mo'  },
  ]

  return (
    <>
      {/* ── Top bar (hidden in print/PDF) ──────────────────────────────── */}
      <div
        className="no-print"
        style={{
          borderBottom: '1px solid var(--hairline)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a
            href="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 16,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            Mana
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                background: 'var(--w)',
                borderRadius: '50%',
                margin: '0 1px',
              }}
            />
            <em style={{ fontStyle: 'italic' }}>Map</em>
          </a>
          <span style={{ color: 'var(--hairline-strong)', fontSize: 14 }}>·</span>
          <a
            href={`/c/${slug}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-3)',
              textDecoration: 'none',
            }}
          >
            {creator.displayName}
          </a>
        </div>

        <a
          href={`/api/c/${slug}/kit.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 500,
            padding: '6px 14px',
            borderRadius: 999,
            border: '1px solid var(--hairline-strong)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          Download PDF
        </a>
      </div>

      {/* ── 2-column media kit ─────────────────────────────────────────── */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 'calc(100vh - 49px)',
        }}
      >
        {/* ── LEFT: dark press-kit pane ────────────────────────────────── */}
        <div
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink-5)',
              margin: '0 0 24px',
            }}
          >
            Media kit · {updatedLabel}
          </p>

          {/* Creator name */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              margin: '0 0 4px',
              color: 'var(--paper)',
            }}
          >
            {creator.displayName}
          </h1>

          {/* Handle + region */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-5)',
              margin: 0,
            }}
          >
            {[
              creator.handle ? `@${creator.handle}` : null,
              creator.region?.name,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {/* Color identity pips */}
          {colors.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {colors.map((c) => (
                <Pip key={c} color={c} size="sm" />
              ))}
            </div>
          )}

          {/* Bio */}
          {creator.bio && (
            <p
              style={{
                marginTop: 18,
                fontSize: 13,
                color: 'var(--ink-5)',
                lineHeight: 1.55,
                maxWidth: '38ch',
              }}
            >
              {creator.bio}
            </p>
          )}

          {/* 2×2 metrics grid */}
          <div
            style={{
              marginTop: 28,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {METRICS.map(({ n, l }) => (
              <div key={l} style={{ padding: 16, background: 'var(--ink)' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 26,
                    color: 'var(--paper)',
                    margin: 0,
                    letterSpacing: '-0.02em',
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
                    color: 'var(--ink-5)',
                    margin: '5px 0 0',
                  }}
                >
                  {l}
                </p>
              </div>
            ))}
          </div>

          {/* Footer: format + tag taxonomy */}
          <div style={{ marginTop: 'auto', paddingTop: 36 }}>
            {formatList && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-5)',
                  margin: '0 0 4px',
                }}
              >
                {formatList}
              </p>
            )}
            {tagList && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-5)',
                  margin: 0,
                }}
              >
                {tagList}
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: light analysis pane ───────────────────────────────── */}
        <div
          style={{
            background: 'var(--surface)',
            padding: '40px 36px',
            borderLeft: '1px solid var(--hairline)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Platform mix */}
          <h2 style={rightH5}>Platform mix</h2>
          {platforms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '10px 0 28px' }}>
              {platforms.map((p) => (
                <div key={p.platform}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--ink-3)',
                      marginBottom: 5,
                    }}
                  >
                    <span>{PLATFORM_LABEL[p.platform] ?? p.platform}</span>
                    <span>
                      {formatCount(p.followers)} · {p.pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: 'var(--paper-soft)',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${p.pct}%`,
                        background: 'var(--ink)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                color: 'var(--ink-4)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: 10,
                marginBottom: 28,
              }}
            >
              No platforms connected.
            </p>
          )}

          {/* Audience table */}
          <h2 style={rightH5}>Audience</h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              margin: '8px 0 28px',
            }}
          >
            <tbody>
              {/* Format affinity from real data */}
              <tr>
                <td style={tdKey}>Format affinity</td>
                <td style={tdVal}>{formatList || 'Not specified'}</td>
              </tr>
              {AUDIENCE_ROWS.map(({ k, v }) => (
                <tr key={k}>
                  <td style={tdKey}>{k}</td>
                  <td style={tdVal}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Recent partnerships */}
          <h2 style={rightH5}>Recent partnerships</h2>
          <ul
            style={{
              paddingLeft: 18,
              margin: '8px 0 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {PARTNERSHIPS.map((p) => (
              <li key={p} style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                {p}
              </li>
            ))}
          </ul>

          {/* Actions (hidden in PDF) */}
          <div
            className="no-print"
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}
          >
            <a
              href={`mailto:?subject=Sponsorship inquiry — ${creator.displayName}&body=Hi, I'd like to discuss a sponsorship with ${creator.displayName}. I found their profile on ManaMap: https://manamap.gg/c/${slug}`}
              style={solidBtn}
            >
              Send sponsor inquiry
            </a>
            <a
              href={`/api/c/${slug}/kit.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={outlineBtn}
            >
              Download PDF
            </a>
          </div>
        </div>
      </main>
    </>
  )
}

// ── Style constants ───────────────────────────────────────────────────────────

const rightH5: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-3)',
  margin: 0,
}

const tdKey: React.CSSProperties = {
  padding: '10px 16px 10px 0',
  borderBottom: '1px solid var(--hairline)',
  color: 'var(--ink-2)',
  fontSize: 13,
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
}

const tdVal: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid var(--hairline)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--ink-3)',
  verticalAlign: 'top',
}

const solidBtn: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 500,
  padding: '8px 18px',
  borderRadius: 999,
  border: 'none',
  background: 'var(--ink)',
  color: 'var(--paper)',
  textDecoration: 'none',
  display: 'inline-block',
}

const outlineBtn: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 500,
  padding: '8px 18px',
  borderRadius: 999,
  border: '1px solid var(--hairline-strong)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  textDecoration: 'none',
  display: 'inline-block',
}
