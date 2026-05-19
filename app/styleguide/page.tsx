import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pip } from '@/components/ui/Pip'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { Hairline } from '@/components/ui/Hairline'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { CreatorCard } from '@/components/ui/CreatorCard'

export const metadata: Metadata = { title: 'Style Guide' }

const COLORS = ['w', 'u', 'b', 'r', 'g'] as const

function SpecLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--ink-4)',
        margin: '0 0 10px',
      }}
    >
      {children}
    </p>
  )
}

function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', ...style }}
    >
      {children}
    </div>
  )
}

const divider = { margin: '80px 0' } satisfies CSSProperties

export default function StyleGuidePage() {
  return (
    <main>
      {/* Top bar */}
      <div
        style={{
          borderBottom: '1px solid var(--hairline)',
          padding: '12px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-3)',
          position: 'sticky',
          top: 0,
          background: 'rgba(245,241,232,0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
        }}
      >
        <span>ManaMap</span>
        <span style={{ color: 'var(--ink-5)' }}>·</span>
        <span>Style Guide</span>
        <span style={{ marginLeft: 'auto' }}>
          <Chip>v0.1</Chip>
        </span>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '80px 48px 120px' }}>

        {/* Page heading */}
        <Eyebrow style={{ marginBottom: 10 }}>Design System</Eyebrow>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 64,
            letterSpacing: '-0.025em',
            lineHeight: 1.0,
            margin: '0 0 12px',
            fontWeight: 400,
          }}
        >
          Component Reference
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            fontStyle: 'italic',
            color: 'var(--ink-2)',
            margin: '0 0 64px',
            maxWidth: '44ch',
          }}
        >
          Warm paper. Editorial type. WUBRG as data-color only.
        </p>

        <Hairline />

        {/* ── 01 Eyebrow ───────────────────────────────────── */}
        <div style={{ paddingTop: 80 }}>
          <Section
            eyebrow="01"
            heading="Eyebrow"
            sub="Geist Mono · 11px · uppercase · ls 0.12em. Used above headings and as metadata labels."
          >
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow>Creator Directory</Eyebrow>
              <Eyebrow>Format · Modern</Eyebrow>
              <Eyebrow>Phase 01 — Discovery</Eyebrow>
            </div>
          </Section>
        </div>

        <Hairline style={divider} />

        {/* ── 02 Pip ───────────────────────────────────────── */}
        <Section
          eyebrow="02"
          heading="Pip"
          sub="12×12 WUBRG color dots. Never used as backgrounds or decoration — color identity only."
        >
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size}>
                <SpecLabel>{size} — {size === 'sm' ? 8 : size === 'md' ? 12 : 18}px</SpecLabel>
                <Row>
                  {COLORS.map((c) => (
                    <Pip key={c} color={c} size={size} />
                  ))}
                </Row>
              </div>
            ))}
          </div>
        </Section>

        <Hairline style={divider} />

        {/* ── 03 Chip ──────────────────────────────────────── */}
        <Section
          eyebrow="03"
          heading="Chip"
          sub="Geist Mono · 10px · uppercase. Tags, formats, categories. Three visual variants."
        >
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <SpecLabel>default — paper-soft bg, hairline border, 3px radius</SpecLabel>
              <Row>
                {['Modern', 'Competitive', 'Commander', 'Gameplay', 'Budget'].map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </Row>
            </div>
            <div>
              <SpecLabel>solid — ink bg, paper text</SpecLabel>
              <Row>
                {['Modern', 'Competitive', 'Commander', 'Gameplay', 'Budget'].map((t) => (
                  <Chip key={t} variant="solid">{t}</Chip>
                ))}
              </Row>
            </div>
            <div>
              <SpecLabel>color — pip dot + label, pill shape</SpecLabel>
              <Row>
                {COLORS.map((c) => (
                  <Chip key={c} variant="color" color={c}>
                    {c === 'w' ? 'White' : c === 'u' ? 'Blue' : c === 'b' ? 'Black' : c === 'r' ? 'Red' : 'Green'}
                  </Chip>
                ))}
              </Row>
            </div>
          </div>
        </Section>

        <Hairline style={divider} />

        {/* ── 04 Button ────────────────────────────────────── */}
        <Section
          eyebrow="04"
          heading="Button"
          sub="Pill-shaped. Geist · 13px · 500 weight. Three intent levels."
        >
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <SpecLabel>outline (default) — white bg, hairline-strong border</SpecLabel>
              <Row>
                <Button variant="outline">Browse Creators</Button>
                <Button variant="outline">View Format</Button>
                <Button variant="outline">See All Events</Button>
              </Row>
            </div>
            <div>
              <SpecLabel>solid — ink bg, paper text. Primary CTA.</SpecLabel>
              <Row>
                <Button variant="solid">Claim Your Profile</Button>
                <Button variant="solid">Get Early Access</Button>
              </Row>
            </div>
            <div>
              <SpecLabel>ghost — transparent, no border. Tertiary action.</SpecLabel>
              <Row>
                <Button variant="ghost">Learn More</Button>
                <Button variant="ghost">See All</Button>
                <Button variant="ghost">Dismiss</Button>
              </Row>
            </div>
          </div>
        </Section>

        <Hairline style={divider} />

        {/* ── 05 Hairline ──────────────────────────────────── */}
        <Section
          eyebrow="05"
          heading="Hairline"
          sub="1px solid #E3DCC9. The primary visual separator. Use shadows sparingly — hairlines first."
        >
          <Card style={{ marginTop: 32 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-2)', margin: '0 0 16px' }}>
              Content above the divider.
            </p>
            <Hairline />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-2)', margin: '16px 0 0' }}>
              Content below the divider.
            </p>
          </Card>
        </Section>

        <Hairline style={divider} />

        {/* ── 06 Card ──────────────────────────────────────── */}
        <Section
          eyebrow="06"
          heading="Card"
          sub="White surface · hairline border · 8px radius. The default content container."
        >
          <div
            style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
          >
            <Card>
              <Eyebrow as="span" style={{ display: 'block', marginBottom: 6 }}>Subscribers</Eyebrow>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 44,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  margin: '4px 0 6px',
                  color: 'var(--ink)',
                }}
              >
                84K
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--ink-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: 0,
                }}
              >
                +12% this month
              </p>
            </Card>

            <Card>
              <Eyebrow as="span" style={{ display: 'block', marginBottom: 6 }}>Platform</Eyebrow>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  letterSpacing: '-0.01em',
                  margin: '4px 0 12px',
                }}
              >
                YouTube · MTG
              </p>
              <Hairline style={{ margin: '0 0 12px' }} />
              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
                Weekly tournament coverage and theory content.
              </p>
            </Card>

            <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Eyebrow as="span" style={{ display: 'block' }}>Color Identity</Eyebrow>
              <Row>
                {COLORS.map((c) => <Pip key={c} color={c} size="lg" />)}
              </Row>
              <Hairline />
              <Row>
                <Chip>Modern</Chip>
                <Chip>Legacy</Chip>
                <Chip>Spike</Chip>
              </Row>
            </Card>
          </div>
        </Section>

        <Hairline style={divider} />

        {/* ── 07 Section ───────────────────────────────────── */}
        <Section
          eyebrow="07"
          heading="Section"
          sub="lp-section-head layout: narrow eyebrow column left, fluid heading + italic sub right. Collapses to single column at 900px."
        >
          <Card noPadding style={{ marginTop: 32, overflow: 'hidden' }}>
            <div
              style={{
                padding: '40px 40px 32px',
                borderBottom: '1px solid var(--hairline)',
                background: 'var(--paper)',
              }}
            >
              <Section
                eyebrow="Featured Creators"
                heading={
                  <>
                    Find your next{' '}
                    <em style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>favorite</em>{' '}
                    content creator
                  </>
                }
                sub="Curated profiles built from real channel data, updated weekly."
              />
            </div>
            <div
              style={{
                padding: '10px 40px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--ink-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              ↓ children render here
            </div>
          </Card>
        </Section>

        <Hairline style={divider} />

        {/* ── 08 CreatorCard ───────────────────────────────── */}
        <Section
          eyebrow="08"
          heading="CreatorCard"
          sub="Color-identity bar · hatched avatar · tag chips · stat row. The core directory unit."
        >
          <div
            style={{
              marginTop: 32,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
            }}
          >
            <CreatorCard
              name="Reid Duke"
              handle="@reidduke"
              colors={['w', 'u', 'b', 'r', 'g']}
              tags={['Competitive', 'Legacy', 'Modern']}
              stats={[{ label: 'Subs', value: '84K' }, { label: 'Videos', value: '420' }]}
            />
            <CreatorCard
              name="Nikachu"
              handle="@nikachumtg"
              colors={['u', 'r']}
              tags={['Modern', 'Izzet', 'Gameplay']}
              stats={[{ label: 'Subs', value: '61K' }, { label: 'Videos', value: '312' }]}
            />
            <CreatorCard
              name="The Mana Drain"
              handle="@themanadrain"
              colors={['u', 'b']}
              tags={['Vintage', 'Legacy', 'Spike']}
              stats={[{ label: 'Subs', value: '28K' }, { label: 'Videos', value: '189' }]}
            />
            <CreatorCard
              name="Strictly Better MtG"
              handle="@strictlybettermtg"
              colors={['g', 'w']}
              tags={['Budget', 'Commander', 'Brewer']}
              stats={[{ label: 'Subs', value: '156K' }, { label: 'Videos', value: '890' }]}
            />
          </div>
        </Section>

        {/* Footer */}
        <div
          style={{
            marginTop: 120,
            paddingTop: 40,
            borderTop: '1px solid var(--hairline)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-4)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>ManaMap Design System</span>
          <span>Phase 0 — 2026</span>
        </div>
      </div>
    </main>
  )
}
