import type { CSSProperties, ReactNode } from 'react'

type Color = 'w' | 'u' | 'b' | 'r' | 'g'
type Variant = 'default' | 'solid' | 'color'

const COLOR_VAR: Record<Color, string> = {
  w: 'var(--w)',
  u: 'var(--u)',
  b: 'var(--b)',
  r: 'var(--r)',
  g: 'var(--g)',
}

interface ChipProps {
  variant?: Variant
  color?: Color
  children: ReactNode
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
}

export function Chip({ variant = 'default', color, children }: ChipProps) {
  if (variant === 'solid') {
    return (
      <span
        style={{
          ...base,
          background: 'var(--ink)',
          color: 'var(--paper)',
          border: '1px solid var(--ink)',
          borderRadius: 3,
          padding: '3px 8px',
        }}
      >
        {children}
      </span>
    )
  }

  if (variant === 'color' && color) {
    return (
      <span
        style={{
          ...base,
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 999,
          padding: '4px 10px',
          color: 'var(--ink-3)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: COLOR_VAR[color],
            flexShrink: 0,
          }}
        />
        {children}
      </span>
    )
  }

  return (
    <span
      style={{
        ...base,
        background: 'var(--paper-soft)',
        border: '1px solid var(--hairline)',
        borderRadius: 3,
        padding: '3px 8px',
        color: 'var(--ink-3)',
      }}
    >
      {children}
    </span>
  )
}
