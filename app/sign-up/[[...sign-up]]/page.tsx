import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import { clerkBrandAppearance, Wordmark } from '@/components/clerk-brand'

export const metadata: Metadata = { title: 'Claim your profile' }

export default function SignUpPage() {
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
      <SignUp appearance={clerkBrandAppearance} />
    </div>
  )
}
