import type { HTMLAttributes } from 'react'

export function Hairline({ style, ...props }: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      style={{ border: 'none', borderTop: '1px solid var(--hairline)', margin: 0, ...style }}
      {...props}
    />
  )
}
