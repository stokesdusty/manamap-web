'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount } from '../actions'

interface AccountFormProps {
  email: string
}

export function AccountForm({ email }: AccountFormProps) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (!result.ok) {
        setError(result.errors.root?.[0] ?? 'Delete failed')
        setConfirming(false)
      } else {
        router.push('/')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Email (read-only) */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 16,
            padding: '14px 22px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-3)',
              paddingTop: 8,
            }}
          >
            Email
          </span>
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                background: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: 5,
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--ink-3)',
              }}
            >
              {email}
            </span>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ink-4)',
                margin: '6px 0 0',
              }}
            >
              Managed by Clerk — change via sign-in settings
            </p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 22px',
            borderBottom: '1px solid var(--hairline)',
            background: 'color-mix(in srgb, var(--r) 8%, var(--surface))',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--r)',
            }}
          >
            Danger zone
          </span>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--ink-2)',
              margin: '0 0 16px',
              lineHeight: 1.5,
            }}
          >
            Permanently delete your ManaMap account. This removes your profile,
            platforms, featured content, and appearances. This action cannot be undone.
          </p>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--r)', margin: '0 0 12px' }}>{error}</p>
          )}

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: '1px solid var(--r)',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--r)',
                cursor: 'pointer',
              }}
            >
              Delete account
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-2)',
                  margin: 0,
                }}
              >
                Are you sure?
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: pending ? 'var(--ink-4)' : 'var(--r)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: '#fff',
                  cursor: pending ? 'not-allowed' : 'pointer',
                }}
              >
                {pending ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--hairline)',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--ink-3)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
