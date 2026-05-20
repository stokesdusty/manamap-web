'use client'

import { useState } from 'react'

interface Props {
  children: React.ReactNode
  filterCount: number
}

export function FiltersDrawer({ children, filterCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open filters"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          border: filterCount > 0 ? '1px solid var(--ink)' : '1px solid var(--hairline-strong)',
          borderRadius: 999,
          background: filterCount > 0 ? 'var(--ink)' : 'var(--surface)',
          color: filterCount > 0 ? 'var(--paper)' : 'var(--ink-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          cursor: 'pointer',
          minHeight: 44,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 3h12M3 7h8M5 11h4" />
        </svg>
        Filters{filterCount > 0 ? ` (${filterCount})` : ''}
      </button>

      {/* Backdrop */}
      {open && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,24,19,0.4)',
            zIndex: 200,
          }}
        />
      )}

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'min(320px, 90vw)',
          background: 'var(--surface)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '4px 0 24px rgba(26,24,19,0.15)',
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--hairline)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ink)',
            }}
          >
            Filters
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              color: 'var(--ink-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {open && children}
        </div>

        {/* Done button */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--hairline)', flexShrink: 0 }}>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Show results
          </button>
        </div>
      </div>
    </>
  )
}
