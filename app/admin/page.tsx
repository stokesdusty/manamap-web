import { db } from '@/db'
import { creatorProfiles, socialAccounts } from '@/db/schema'
import { count, lt, isNull, or, and, inArray } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const metadata = { title: 'Admin — ManaMap' }

export default async function AdminPage() {
  const [totalCreators] = await db
    .select({ count: count() })
    .from(creatorProfiles)

  const [publishedCreators] = await db
    .select({ count: count() })
    .from(creatorProfiles)
    .where(sql`${creatorProfiles.published} = true`)

  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [staleAccounts] = await db
    .select({ count: count() })
    .from(socialAccounts)
    .where(
      and(
        inArray(socialAccounts.platform, ['youtube', 'twitch']),
        or(
          isNull(socialAccounts.syncedAt),
          lt(socialAccounts.syncedAt, staleThreshold)
        )
      )
    )

  const stats = [
    { label: 'Total creators', value: totalCreators?.count ?? 0 },
    { label: 'Published', value: publishedCreators?.count ?? 0 },
    { label: 'Stale sync accounts', value: staleAccounts?.count ?? 0 },
  ]

  const actions = [
    {
      href: '/admin/import',
      title: 'Import creators',
      description: 'Paste CSV to bulk-upsert creator profiles and social accounts.',
    },
    {
      href: '/admin/creators',
      title: 'Manage creators',
      description: 'Paginated list with inline re-sync, publish, and delete actions.',
    },
    {
      href: '/admin/resync',
      title: 'Bulk resync',
      description: 'Re-run syncSocialAccount for every YouTube/Twitch account older than 24h.',
    },
  ]

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          fontWeight: 400,
          margin: '0 0 24px',
        }}
      >
        Admin dashboard
      </h1>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        {stats.map(({ label, value }) => (
          <div
            key={label}
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              padding: '16px 20px',
              background: 'var(--surface)',
              minWidth: 160,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {value.toLocaleString()}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-4)',
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {actions.map(({ href, title, description }) => (
          <a
            key={href}
            href={href}
            style={{
              display: 'block',
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              padding: '20px 24px',
              background: 'var(--surface)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--ink)',
                marginBottom: 8,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--ink-3)',
                lineHeight: 1.5,
              }}
            >
              {description}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
