import type { Metadata } from 'next'
import { desc, count } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles } from '@/db/schema'
import { CreatorRow } from './_components/CreatorRow'

export const metadata: Metadata = { title: 'Creators — Admin' }

const PAGE_SIZE = 50

type Props = { searchParams: Promise<{ page?: string }> }

export default async function AdminCreatorsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  const [creators, countResult] = await Promise.all([
    db.query.creatorProfiles.findMany({
      orderBy: [desc(creatorProfiles.createdAt)],
      limit: PAGE_SIZE,
      offset,
      with: {
        socialAccounts: {
          columns: {
            id: true,
            platform: true,
            followers: true,
            syncedAt: true,
            lastSyncError: true,
          },
        },
      },
    }),
    db.select({ count: count() }).from(creatorProfiles),
  ])

  const total = countResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const monoStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--ink-4)',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 24,
            fontWeight: 400,
            margin: 0,
          }}
        >
          Creators
        </h1>
        <span style={monoStyle}>{total.toLocaleString()} total</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 8,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid var(--hairline)' }}>
              {['Slug', 'Name', 'Status', 'Followers', 'Last synced', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    ...monoStyle,
                    fontWeight: 500,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => (
              <CreatorRow
                key={c.id}
                creator={{
                  id: c.id,
                  slug: c.slug,
                  displayName: c.displayName,
                  published: c.published,
                  followersTotal: c.followersTotal,
                  socialAccounts: c.socialAccounts.map((a) => ({
                    id: a.id,
                    platform: a.platform,
                    followers: a.followers,
                    syncedAt: a.syncedAt ?? null,
                    lastSyncError: a.lastSyncError ?? null,
                  })),
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center' }}>
          {page > 1 && (
            <a
              href={`/admin/creators?page=${page - 1}`}
              style={{ ...monoStyle, color: 'var(--u)', textDecoration: 'none' }}
            >
              ← Prev
            </a>
          )}
          <span style={monoStyle}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/creators?page=${page + 1}`}
              style={{ ...monoStyle, color: 'var(--u)', textDecoration: 'none' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
