import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  noPadding?: boolean
}

export function Card({ noPadding = false, style, children, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        padding: noPadding ? undefined : 24,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
