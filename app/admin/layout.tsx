import { requireAdmin } from '@/lib/admin'

const navLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--ink-3)',
  textDecoration: 'none',
  padding: '4px 10px',
  borderRadius: 4,
  border: '1px solid var(--hairline)',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--paper)',
            opacity: 0.6,
          }}
        >
          ManaMap Admin
        </span>
        <nav style={{ display: 'flex', gap: 8 }}>
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/import', label: 'Import' },
            { href: '/admin/creators', label: 'Creators' },
            { href: '/admin/resync', label: 'Resync' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                ...navLinkStyle,
                background: 'transparent',
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Internal — do not share
        </span>
      </header>
      <main style={{ padding: '32px 40px', maxWidth: 1200 }}>{children}</main>
    </div>
  )
}
