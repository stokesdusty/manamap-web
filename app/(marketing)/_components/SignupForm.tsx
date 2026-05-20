'use client'

import { useState, useTransition } from 'react'
import { addToWaitlist } from '../actions'

interface SignupFormProps {
  id?: string
}

export function SignupForm({ id }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addToWaitlist(email)
      if (result.ok) {
        setDone(true)
        setEmail('')
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div>
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
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
