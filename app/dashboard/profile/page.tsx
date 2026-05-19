import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { contentTags, formatTags, regions } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'
import { ProfileEditForm } from './_components/ProfileEditForm'

export const metadata: Metadata = { title: 'Edit Profile' }

// Stub stats — replace with real analytics in Phase 2
const STATS = [
  { n: '2,184', label: 'Profile views · 30d',  delta: '▲ 24% vs prev.' },
  { n: '312',   label: 'Outbound clicks',       delta: '▲ 8%'           },
  { n: '14',    label: 'Sponsor views',         delta: '▲ 2'            },
  { n: '96%',   label: 'Avg search match',      delta: '—'              },
]

export default async function DashboardProfilePage() {
  const [creator, fmtRows, tagRows, regionRows] = await Promise.all([
    getCurrentCreator(),
    db.query.formatTags.findMany({ orderBy: [asc(formatTags.name)] }),
    db.query.contentTags.findMany({ orderBy: [asc(contentTags.label)] }),
    db.query.regions.findMany({ orderBy: [asc(regions.name)] }),
  ])

  const allFormats   = fmtRows.map((f) => ({ code: f.code, name: f.name }))
  const styleTags    = tagRows.filter((t) => t.kind === 'style' || t.kind === 'theme').map((t) => ({ code: t.code, label: t.label }))
  const audienceTags = tagRows.filter((t) => t.kind === 'audience').map((t) => ({ code: t.code, label: t.label }))
  const allRegions   = regionRows.map((r) => ({ id: r.id, code: r.code, name: r.name }))

  const initial = creator
    ? {
        displayName: creator.displayName,
        handle:      creator.handle ?? creator.slug,
        bio:         creator.bio ?? '',
        regionId:    creator.regionId?.toString() ?? '',
        formats:     creator.formats.map((f) => f.format.code),
        colors:      creator.colors,
        tags:        creator.contentTags.filter((ct) => ct.tag.kind === 'style' || ct.tag.kind === 'theme').map((ct) => ct.tag.code),
        audience:    creator.contentTags.filter((ct) => ct.tag.kind === 'audience').map((ct) => ct.tag.code),
      }
    : { displayName: '', handle: '', bio: '', regionId: '', formats: [], colors: [], tags: [], audience: [] }

  const completionPct = creator ? calcCompletion(creator) : 0

  return (
    <main style={{ background: 'var(--paper)', padding: '24px 28px', minHeight: '100vh' }}>
      {/* Page header */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          letterSpacing: '-0.02em',
          fontWeight: 400,
          margin: '0 0 4px',
        }}
      >
        Edit profile
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-3)',
          margin: '0 0 24px',
        }}
      >
        Profile · {completionPct}% complete
        {creator && (
          <>
            {' · '}
            <a
              href={`/c/${creator.slug}`}
              style={{ color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 2 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              View public profile ↗
            </a>
          </>
        )}
      </p>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {STATS.map(({ n, label, delta }) => (
          <div
            key={label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              padding: 14,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0,
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
                margin: '4px 0 2px',
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: delta.startsWith('▲') ? 'var(--g)' : 'var(--ink-4)',
                margin: 0,
              }}
            >
              {delta}
            </p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <ProfileEditForm
        initial={initial}
        allFormats={allFormats}
        styleTags={styleTags}
        audienceTags={audienceTags}
        allRegions={allRegions}
      />
    </main>
  )
}

// ── Profile completion % ──────────────────────────────────────────────────────

function calcCompletion(creator: NonNullable<Awaited<ReturnType<typeof getCurrentCreator>>>) {
  const checks = [
    !!creator.displayName,
    !!creator.handle,
    !!creator.bio,
    creator.formats.length > 0,
    creator.colors.length > 0,
    creator.contentTags.length > 0,
    creator.socialAccounts.length > 0,
    !!creator.regionId,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
