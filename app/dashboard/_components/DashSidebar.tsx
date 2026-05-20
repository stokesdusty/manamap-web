'use client'

import { usePathname } from 'next/navigation'

const NAV = [
  {
    group: 'Workspace',
    links: [
      { href: '/dashboard/profile',   label: 'Profile'   },
      { href: '/dashboard/platforms', label: 'Platforms' },
      { href: '/dashboard/tags',      label: 'Tags'      },
      { href: '/dashboard/featured',  label: 'Featured'  },
    ],
  },
  {
    group: 'Business',
    links: [
      { href: '/dashboard/kit',       label: 'Media kit'   },
      { href: '/dashboard/analytics', label: 'Analytics'   },
      { href: '/dashboard/inquiries', label: 'Inquiries'   },
    ],
  },
  {
    group: 'Account',
    links: [
      { href: '/dashboard/billing',   label: 'Plan & billing' },
      { href: '/dashboard/account',   label: 'Account'        },
    ],
  },
]

export function DashSidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '20px 16px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Wordmark */}
      <a
        href="/"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          letterSpacing: '-0.02em',
          textDecoration: 'none',
          color: 'var(--paper)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 28,
          flexShrink: 0,
        }}
      >
        Mana
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            background: 'var(--w)',
            borderRadius: '50%',
            margin: '0 1px',
          }}
        />
        <em style={{ fontStyle: 'italic' }}>Map</em>
      </a>

      {/* Nav groups */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(({ group, links }) => (
          <div key={group}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ink-5)',
                margin: '14px 0 4px 10px',
              }}
            >
              {group}
            </p>
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <a
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: 4,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    textDecoration: 'none',
                    color: active ? 'var(--paper)' : 'var(--ink-5)',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    transition: 'background var(--t-fast)',
                  }}
                >
                  {label}
                  {active && href === '/dashboard/profile' && (
                    <span style={{ color: 'var(--g)', fontSize: 10 }}>●</span>
                  )}
                </a>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
