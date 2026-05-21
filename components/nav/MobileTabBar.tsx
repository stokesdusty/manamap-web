'use client'

import { usePathname } from 'next/navigation'

const TABS = [
  {
    label: 'Discover',
    href: '/',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6.5v3.5l2.5 2.5" />
      </svg>
    ),
  },
  {
    label: 'Search',
    href: '/search',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="8.5" cy="8.5" r="5" />
        <path d="M15 15l-3-3" />
      </svg>
    ),
  },
  {
    label: 'Saved',
    href: '/saved',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3h10a1 1 0 011 1v13l-6-4-6 4V4a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    label: 'Me',
    href: '/dashboard',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
]

// Routes where the tab bar should not appear
const HIDE_PREFIXES = ['/dashboard', '/sign-in', '/sign-up', '/onboard']

export function MobileTabBar() {
  const pathname = usePathname()

  const shouldHide = HIDE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
  if (shouldHide) return null

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: 'var(--surface)',
        borderTop: '1px solid var(--hairline)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
        // Hidden on desktop via CSS in globals.css — override with display:none above md
      }}
      className="md:hidden"
    >
      {TABS.map(({ label, href, icon }) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <a
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              minHeight: 56,
              padding: '8px 4px',
              textDecoration: 'none',
              color: active ? 'var(--ink)' : 'var(--ink-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'color var(--t-fast)',
            }}
          >
            {icon}
            {label}
          </a>
        )
      })}
    </nav>
  )
}
