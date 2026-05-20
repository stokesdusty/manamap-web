import type { Metadata } from 'next'
import { getCurrentCreator } from '@/lib/auth'
import type { PlatformsFormValues } from '@/lib/validators/platforms'
import { PlatformsForm } from './_components/PlatformsForm'

export const metadata: Metadata = { title: 'Platforms' }

export default async function DashboardPlatformsPage() {
  const creator = await getCurrentCreator()

  const initial: PlatformsFormValues = {
    youtube:   '',
    twitch:    '',
    tiktok:    '',
    bluesky:   '',
    twitter:   '',
    instagram: '',
    patreon:   '',
    moxfield:  '',
    archidekt: '',
    podcast:   '',
  }

  if (creator) {
    for (const acct of creator.socialAccounts) {
      const p = acct.platform as keyof PlatformsFormValues
      if (p in initial) initial[p] = acct.handle
    }
  }

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
        Platforms
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
        Connect · Enter your handle on each platform you use
      </p>

      <PlatformsForm initial={initial} />
    </main>
  )
}
