import { Button } from '@/components/ui/Button'

export function SiteNav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(245,241,232,0.86)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Wordmark */}
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            color: 'var(--ink)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          Mana
          <span
            aria-hidden="true"
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

        {/* Nav links */}
        <div
          style={{
            display: 'flex',
            gap: 28,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
          }}
        >
          <a href="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Discover</a>
          <a href="/event" style={{ color: 'inherit', textDecoration: 'none' }}>Events</a>
          <a href="/store" style={{ color: 'inherit', textDecoration: 'none' }}>Stores</a>
          <a href="/format/edh" style={{ color: 'inherit', textDecoration: 'none' }}>Formats</a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button variant="ghost" style={{ fontSize: 12 }}>Sign in</Button>
          <Button variant="solid" style={{ fontSize: 12 }}>Claim profile</Button>
        </div>
      </div>
    </nav>
  )
}
