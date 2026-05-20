import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'
import { clerkBrandAppearance, Wordmark } from '@/components/clerk-brand'

export const metadata: Metadata = { title: 'Sign in' }

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <Wordmark />
      </div>
      <SignIn appearance={clerkBrandAppearance} />
    </div>
  )
}
