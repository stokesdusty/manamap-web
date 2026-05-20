'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const NAV = [
  { href: '/dashboard/profile',   label: 'Profile'       },
  { href: '/dashboard/platforms', label: 'Platforms'     },
  { href: '/dashboard/tags',      label: 'Tags'          },
  { href: '/dashboard/featured',  label: 'Featured'      },
  { href: '/dashboard/account',   label: 'Account'       },
]

export function DashTopBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: 52,
          background: 'var(--ink)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* Wordmark */}
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            color: 'var(--paper)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Mana
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              background: 'var(--w)',
              borderRadius: '50%',
              margin: '0 1px',
            }}
          />
          <em style={{ fontStyle: 'italic' }}>Map</em>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserButton />
          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              color: 'var(--paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 44,
              minHeight: 44,
            }}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l12 12M15 3L3 15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4h14M2 9h14M2 14h14" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Drawer */}
      <nav
        aria-label="Dashboard navigation"
        style={{
          position: 'fixed',
          top: 52,
          right: 0,
          bottom: 0,
          width: 'min(280px, 85vw)',
          background: 'var(--ink)',
          zIndex: 41,
          padding: '16px 12px',
          overflowY: 'auto',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 10px',
                borderRadius: 4,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                textDecoration: 'none',
                color: active ? 'var(--paper)' : 'var(--ink-5)',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                minHeight: 44,
              }}
            >
              {label}
            </a>
          )
        })}
      </nav>
    </>
  )
}
