import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { contentTags, formatTags, regions } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'
import { getProfileViewCount } from '@/lib/posthog-server'
import { ProfileEditForm } from './_components/ProfileEditForm'
import type { ProfileFormValues } from '@/lib/validators/profile'

export const metadata: Metadata = { title: 'Edit Profile' }

export default async function DashboardProfilePage() {
  const [creator, fmtRows, tagRows, regionRows] = await Promise.all([
    getCurrentCreator(),
    db.query.formatTags.findMany({ orderBy: [asc(formatTags.name)] }),
    db.query.contentTags.findMany({ orderBy: [asc(contentTags.label)] }),
    db.query.regions.findMany({ orderBy: [asc(regions.name)] }),
  ])

  const profileViewCount = creator
    ? await getProfileViewCount(creator.slug)
    : null

  const allFormats   = fmtRows.map((f) => ({ code: f.code, name: f.name }))
  const styleTags    = tagRows.filter((t) => t.kind === 'style' || t.kind === 'theme').map((t) => ({ code: t.code, label: t.label }))
  const audienceTags = tagRows.filter((t) => t.kind === 'audience').map((t) => ({ code: t.code, label: t.label }))
  const allRegions   = regionRows.map((r) => ({ id: r.id, code: r.code, name: r.name }))

  const initial: ProfileFormValues = creator
    ? {
        displayName: creator.displayName,
        handle:      creator.handle ?? creator.slug,
        bio:         creator.bio ?? '',
        websiteUrl:  creator.websiteUrl ?? '',
        avatarUrl:   creator.avatarUrl ?? '',
        bannerUrl:   creator.bannerUrl ?? '',
        regionId:    creator.regionId?.toString() ?? '',
        formats:     creator.formats.map((f) => f.format.code),
        colors:      creator.colors,
        tags:        creator.contentTags.filter((ct) => ct.tag.kind === 'style' || ct.tag.kind === 'theme').map((ct) => ct.tag.code),
        audience:    creator.contentTags.filter((ct) => ct.tag.kind === 'audience').map((ct) => ct.tag.code),
      }
    : { displayName: '', handle: '', bio: '', websiteUrl: '', avatarUrl: '', bannerUrl: '', regionId: '', formats: [], colors: [], tags: [], audience: [] }

  const completionPct = creator ? calcCompletion(creator) : 0

  const STATS = [
    {
      n:     profileViewCount !== null ? profileViewCount.toLocaleString() : '—',
      label: 'Profile views · 30d',
      delta: profileViewCount !== null ? '' : 'PostHog not configured',
      real:  true,
    },
    { n: '—', label: 'Outbound clicks',  delta: 'Phase 2', real: false },
    { n: '—', label: 'Sponsor views',    delta: 'Phase 4', real: false },
    { n: '—', label: 'Avg search match', delta: 'Phase 2', real: false },
  ]

  return (
    <main style={{ background: 'var(--paper)', padding: '24px 28px', minHeight: '100vh' }}>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {STATS.map(({ n, label, delta, real }) => (
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
            {delta && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: real ? 'var(--ink-4)' : 'var(--ink-5)',
                  margin: 0,
                }}
              >
                {delta}
              </p>
            )}
          </div>
        ))}
      </div>

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
