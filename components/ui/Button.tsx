import type { ButtonHTMLAttributes, CSSProperties } from 'react'

type Variant = 'solid' | 'ghost' | 'outline'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variantStyles: Record<Variant, CSSProperties> = {
  solid: {
    background: 'var(--ink)',
    color: 'var(--paper)',
    border: '1px solid var(--ink)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--ink)',
    border: 'none',
  },
  outline: {
    background: 'var(--surface)',
    color: 'var(--ink)',
    border: '1px solid var(--hairline-strong)',
  },
}

export function Button({ variant = 'outline', style, ...props }: ButtonProps) {
  return (
    <button
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500,
        padding: '8px 18px',
        borderRadius: 999,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        lineHeight: 1,
        transition: 'background var(--t-fast)',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    />
  )
}
