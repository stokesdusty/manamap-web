import type { HTMLAttributes, ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'
import styles from './Section.module.css'

type SectionProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string
  heading: ReactNode
  sub?: string
}

export function Section({ eyebrow, heading, sub, children, className = '', ...props }: SectionProps) {
  return (
    <div className={className} {...props}>
      <div className={styles.head}>
        <div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}</div>
        <div>
          <h2 className={styles.heading}>{heading}</h2>
          {sub && <p className={styles.sub}>{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}
