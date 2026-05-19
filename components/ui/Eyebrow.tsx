import type { ElementType, HTMLAttributes } from 'react'

type EyebrowProps = HTMLAttributes<HTMLElement> & {
  as?: 'p' | 'div' | 'span'
}

export function Eyebrow({ as = 'p', className = '', ...props }: EyebrowProps) {
  const Tag = as as ElementType
  return <Tag className={`t-eyebrow ${className}`.trim()} {...props} />
}
