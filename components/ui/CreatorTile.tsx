import { Chip } from './Chip'

interface CreatorTileProps {
  slug: string
  displayName: string
  handle: string | null
  colors?: Array<'w' | 'u' | 'b' | 'r' | 'g'>
  tagLabels?: string[]
}

export function CreatorTile({
  slug,
  displayName,
  handle,
  colors = [],
  tagLabels = [],
}: CreatorTileProps) {
  return (
    <a
      href={`/c/${slug}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Avatar area + colorbar */}
      <div
        style={{
          height: 72,
          background:
            'repeating-linear-gradient(45deg, var(--paper-soft) 0 6px, var(--paper) 6px 12px)',
          position: 'relative',
          borderBottom: '1px solid var(--hairline)',
          flexShrink: 0,
        }}
      >
        {colors.length > 0 && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              display: 'flex',
            }}
          >
            {colors.map((c) => (
              <span key={c} style={{ flex: 1, backgroundColor: `var(--${c})` }} />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flex: 1,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {displayName}
        </p>
        {handle && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--ink-3)',
              margin: 0,
            }}
          >
            @{handle}
          </p>
        )}
        {tagLabels.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
            {tagLabels.slice(0, 2).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
