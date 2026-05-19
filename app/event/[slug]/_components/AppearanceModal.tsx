'use client'

import { useState, useTransition } from 'react'
import { addAppearance } from '../actions'

const ROLES = [
  { value: 'attendee',       label: 'Attending'       },
  { value: 'panelist',       label: 'Panelist'         },
  { value: 'featured_guest', label: 'Featured Guest'   },
  { value: 'signing',        label: 'Signing'          },
  { value: 'booth',          label: 'Booth'            },
  { value: 'coverage',       label: 'Coverage'         },
  { value: 'competitor',     label: 'Competitor'       },
  { value: 'judge',          label: 'Judge'            },
]

interface AppearanceModalProps {
  eventId: number
  eventSlug: string
  isAuthenticated: boolean
  creatorName: string | null
}

export function AppearanceModal({
  eventId,
  eventSlug,
  isAuthenticated,
  creatorName,
}: AppearanceModalProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('attendee')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function close() {
    setOpen(false)
    setError(null)
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await addAppearance(eventId, eventSlug, role)
      if (result.ok) {
        setSuccess(true)
        close()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          padding: '6px 14px',
          borderRadius: 999,
          cursor: 'pointer',
          background: 'transparent',
          border: '1px solid var(--ink-5)',
          color: 'var(--paper)',
        }}
      >
        {success ? 'Appearance added ✓' : 'Add my appearance'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={close}
            style={{ position: 'absolute', inset: 0, background: 'rgba(26,24,19,0.6)' }}
          />

          {/* Dialog card */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              padding: '28px 32px',
              width: '100%',
              maxWidth: 420,
              zIndex: 1,
            }}
          >
            {isAuthenticated ? (
              <>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink-4)',
                    margin: '0 0 6px',
                  }}
                >
                  Add appearance
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    margin: '0 0 20px',
                  }}
                >
                  How are you attending?
                </h2>

                {creatorName && (
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 16px' }}>
                    Adding as <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{creatorName}</strong>
                  </p>
                )}

                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ink-3)',
                    marginBottom: 6,
                  }}
                >
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--surface-tint)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 5,
                    padding: '8px 12px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--ink)',
                    marginBottom: 16,
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>

                {error && (
                  <p style={{ fontSize: 13, color: 'var(--r)', margin: '0 0 12px' }}>{error}</p>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={close}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      padding: '8px 16px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ink-3)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={pending}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '8px 20px',
                      borderRadius: 999,
                      border: 'none',
                      background: pending ? 'var(--ink-4)' : 'var(--ink)',
                      color: 'var(--paper)',
                      cursor: pending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {pending ? 'Adding…' : 'Add appearance'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    margin: '0 0 12px',
                  }}
                >
                  Claim your profile first
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 20px', lineHeight: 1.55 }}>
                  Set up your creator profile to track your event appearances.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href="/onboard"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '8px 20px',
                      borderRadius: 999,
                      border: 'none',
                      background: 'var(--ink)',
                      color: 'var(--paper)',
                      textDecoration: 'none',
                    }}
                  >
                    Set up profile →
                  </a>
                  <button
                    onClick={close}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      padding: '8px 16px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ink-3)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
