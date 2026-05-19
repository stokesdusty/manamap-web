'use client'

import { useState } from 'react'

const SEGMENTS = [
  { id: 'creators', label: 'Creators', action: '/search' },
  { id: 'events',   label: 'Events',   action: '/event'  },
  { id: 'stores',   label: 'Stores',   action: '/store'  },
] as const

type SegmentId = (typeof SEGMENTS)[number]['id']

export function SearchBar() {
  const [active, setActive] = useState<SegmentId>('creators')
  const action = SEGMENTS.find((s) => s.id === active)!.action

  return (
    <form
      method="GET"
      action={action}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--hairline-strong)',
        borderRadius: 999,
        padding: '6px 6px 6px 18px',
        maxWidth: 540,
        gap: 10,
      }}
    >
      <input
        name="q"
        type="search"
        placeholder="Find a creator, format, or city…"
        autoComplete="off"
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--ink)',
          outline: 'none',
          padding: '6px 0',
          minWidth: 0,
        }}
      />

      {/* Segment switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'var(--paper-soft)',
          borderRadius: 999,
          padding: 4,
        }}
      >
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            style={{
              padding: '2px 10px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              background: active === s.id ? 'var(--ink)' : 'transparent',
              color: active === s.id ? 'var(--paper)' : 'var(--ink-3)',
              transition: 'background var(--t-fast)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        type="submit"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 18px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--ink)',
          color: 'var(--paper)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Search
      </button>
    </form>
  )
}
