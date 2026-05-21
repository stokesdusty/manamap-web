'use client'

import { useState, useTransition } from 'react'
import { usePostHog } from 'posthog-js/react'
import { addToWaitlist } from '../actions'
import type { WaitlistSource } from '../actions'

interface SignupFormProps {
  id?: string
  source: WaitlistSource
}

export function SignupForm({ id, source }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const posthog = usePostHog()

  function handleFocus() {
    if (!started) {
      setStarted(true)
      posthog.capture('signup_started', { source })
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addToWaitlist({ email, source, honeypot })
      if (result.ok) {
        setDone(true)
        setEmail('')
        posthog.capture('waitlist_signup', { source })
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      {/* Honeypot — invisible to humans, filled by bots */}
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', top: 0, width: 1, height: 1 }}
      />

      <form
        id={id}
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--hairline-strong)',
          borderRadius: 999,
          padding: '6px 6px 6px 22px',
          maxWidth: 480,
          gap: 10,
          marginBottom: 12,
        }}
      >
        <label htmlFor={`${id ?? source}-email`} style={{ position: 'absolute', left: '-9999px' }}>
          Email address
        </label>
        <input
          id={`${id ?? source}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={handleFocus}
          placeholder="you@email.com"
          required
          disabled={done || pending}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            color: 'var(--ink)',
            padding: '8px 0',
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={done || pending}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 500,
            padding: '10px 22px',
            borderRadius: 999,
            border: 'none',
            background: done ? 'var(--g)' : 'var(--ink)',
            color: 'var(--paper)',
            cursor: done || pending ? 'default' : 'pointer',
            flexShrink: 0,
            transition: 'background var(--t-base)',
          }}
        >
          {done ? 'On the list ✓' : pending ? 'Adding…' : 'Notify me'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: 13,
            color: 'var(--r)',
            fontFamily: 'var(--font-sans)',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
