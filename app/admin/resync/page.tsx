import type { Metadata } from 'next'
import { and, inArray, isNull, lt, or, count } from 'drizzle-orm'
import { db } from '@/db'
import { socialAccounts } from '@/db/schema'
import { ResyncForm } from './_components/ResyncForm'

export const metadata: Metadata = { title: 'Resync — Admin' }

export default async function AdminResyncPage() {
  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [staleCount] = await db
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

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 24,
            fontWeight: 400,
            margin: 0,
          }}
        >
          Bulk resync
        </h1>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: staleCount?.count ? 'var(--r)' : 'var(--ink-4)',
          }}
        >
          {staleCount?.count ?? 0} stale accounts
        </span>
      </div>
      <ResyncForm />
    </div>
  )
}
