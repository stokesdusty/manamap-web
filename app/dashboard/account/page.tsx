import type { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs/server'
import { AccountForm } from './_components/AccountForm'

export const metadata: Metadata = { title: 'Account' }

export default async function DashboardAccountPage() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '—'

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
        Account
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
        Settings · {email}
      </p>

      <AccountForm email={email} />
    </main>
  )
}
