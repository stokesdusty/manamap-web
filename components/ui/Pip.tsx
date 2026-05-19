type Color = 'w' | 'u' | 'b' | 'r' | 'g'
type Size = 'sm' | 'md' | 'lg'

const SIZE_PX: Record<Size, number> = { sm: 8, md: 12, lg: 18 }
const COLOR_VAR: Record<Color, string> = {
  w: 'var(--w)',
  u: 'var(--u)',
  b: 'var(--b)',
  r: 'var(--r)',
  g: 'var(--g)',
}

interface PipProps {
  color: Color
  size?: Size
}

export function Pip({ color, size = 'md' }: PipProps) {
  const px = SIZE_PX[size]
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: px,
        height: px,
        borderRadius: '50%',
        backgroundColor: COLOR_VAR[color],
        flexShrink: 0,
      }}
    />
  )
}
