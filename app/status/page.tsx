import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/db'
import { creatorProfiles, events, stores } from '@/db/schema'
import { count } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const metadata: Metadata = { title: 'Status | ManaMap' }

// Revalidate every 30s — this is a low-traffic internal page.
export const revalidate = 30

interface StatusRow {
  label: string
  value: string | number
  ok: boolean
  note?: string
}

async function getStatusData(): Promise<{
  db: boolean
  dbError?: string
  rows: StatusRow[]
  checkedAt: string
}> {
  const checkedAt = new Date().toISOString()

  // DB connectivity probe
  let dbOk = false
  let dbError: string | undefined
  try {
    await db.execute(sql`SELECT 1`)
    dbOk = true
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err)
  }

  if (!dbOk) {
    return { db: false, dbError, rows: [], checkedAt }
  }

  const [creatorCount, publishedCount, eventCount, storeCount] = await Promise.all([
    db.select({ n: count() }).from(creatorProfiles),
    db.select({ n: count() }).from(creatorProfiles).where(eq(creatorProfiles.published, true)),
    db.select({ n: count() }).from(events),
    db.select({ n: count() }).from(stores),
  ])

  // Waitlist count via Resend
  let waitlistCount: string = 'see Resend dashboard'
  try {
    const apiKey = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (apiKey && audienceId) {
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      const { data } = await resend.contacts.list({ audienceId })
      waitlistCount = String((data as { data?: unknown[] } | null)?.data?.length ?? '—')
    }
  } catch {
    // Non-fatal — Resend may not be configured or API may differ
  }

  const rows: StatusRow[] = [
    {
      label: 'DB connectivity',
      value: 'OK',
      ok: true,
    },
    {
      label: 'Creators (total)',
      value: creatorCount[0]?.n ?? 0,
      ok: true,
    },
    {
      label: 'Creators (published)',
      value: publishedCount[0]?.n ?? 0,
      ok: (publishedCount[0]?.n ?? 0) > 0,
      note: 'Only published profiles are visible in search',
    },
    {
      label: 'Events',
      value: eventCount[0]?.n ?? 0,
      ok: true,
    },
    {
      label: 'Stores',
      value: storeCount[0]?.n ?? 0,
      ok: true,
    },
    {
      label: 'Waitlist signups',
      value: waitlistCount,
      ok: true,
      note: 'Managed via Resend audience',
    },
    {
      label: 'Scheduled jobs',
      value: 'Not configured',
      ok: true,
      note: 'Inngest sync jobs are Phase 2+',
    },
  ]

  return { db: true, rows, checkedAt }
}

export default async function StatusPage() {
  await requireAdmin()
  const status = await getStatusData()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-sans)' }}>
      <header
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          ManaMap / Status
        </span>
        <a
          href="/admin"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
          }}
        >
          ← Admin
        </a>
      </header>

      <main style={{ maxWidth: 800, margin: '48px auto', padding: '0 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            System status
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Checked {new Date(status.checkedAt).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false })} UTC
          </span>
        </div>

        {/* DB down — show error card */}
        {!status.db && (
          <div
            style={{
              background: 'var(--r)',
              color: 'var(--paper)',
              borderRadius: 8,
              padding: '20px 24px',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
                opacity: 0.8,
              }}
            >
              Database unreachable
            </div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {status.dbError}
            </code>
          </div>
        )}

        {/* Status table */}
        {status.rows.length > 0 && (
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {status.rows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  padding: '14px 20px',
                  borderTop: i > 0 ? '1px solid var(--hairline)' : undefined,
                  alignItems: 'center',
                  background: 'var(--surface)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--ink)',
                    }}
                  >
                    {row.label}
                  </div>
                  {row.note && (
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--ink-4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginTop: 3,
                      }}
                    >
                      {row.note}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: 'var(--ink)',
                      fontWeight: 500,
                    }}
                  >
                    {row.value}
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: row.ok ? 'var(--g)' : 'var(--r)',
                      flexShrink: 0,
                    }}
                    title={row.ok ? 'OK' : 'Issue'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
