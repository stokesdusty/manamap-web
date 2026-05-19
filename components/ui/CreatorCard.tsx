import styles from './CreatorCard.module.css'

type Color = 'w' | 'u' | 'b' | 'r' | 'g'

const COLOR_VAR: Record<Color, string> = {
  w: 'var(--w)',
  u: 'var(--u)',
  b: 'var(--b)',
  r: 'var(--r)',
  g: 'var(--g)',
}

interface CreatorCardProps {
  name: string
  handle: string
  tags?: string[]
  colors?: Color[]
  stats?: Array<{ label: string; value: string | number }>
}

export function CreatorCard({ name, handle, tags = [], colors = [], stats = [] }: CreatorCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {colors.length > 0 && (
          <div className={styles.colorbar}>
            {colors.map((c) => (
              <span key={c} style={{ backgroundColor: COLOR_VAR[c] }} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.name}>{name}</p>
        <p className={styles.handle}>{handle}</p>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        )}
      </div>
      {stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map(({ label, value }) => (
            <span key={label}>
              <strong>{value}</strong> {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
