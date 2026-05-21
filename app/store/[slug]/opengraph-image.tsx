import { ImageResponse } from 'next/og'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { stores } from '@/db/schema'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Local game store on ManaMap'

const ALL_PIPS = ['#D4C68E', '#3F6FA8', '#2C2730', '#BF5142', '#5C8A5A']

async function loadNewsreader(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@1,6..72,400&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
    ).then((r) => r.text())
    const url = css.match(/src: url\((.+?\.woff2)\)/)?.[1]
    if (!url) return null
    return fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

type Props = { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params

  const [store, fontData] = await Promise.all([
    db.query.stores.findFirst({
      where: eq(stores.slug, slug),
      columns: { name: true, address: true, verified: true },
    }),
    loadNewsreader(),
  ])

  const name = store?.name ?? 'Local Game Store'
  const address = store?.address
    ? store.address.length > 60
      ? `${store.address.slice(0, 58)}…`
      : store.address
    : null
  const verified = store?.verified ?? false
  const fontSize = name.length > 32 ? 52 : name.length > 22 ? 62 : 72

  return new ImageResponse(
    (
      <div
        style={{
          background: '#F5F1E8',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 80px',
          justifyContent: 'space-between',
          fontFamily: fontData ? '"Newsreader"' : 'Georgia, serif',
        }}
      >
        {/* Top: wordmark + category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, color: '#1A1813', letterSpacing: '-0.01em' }}>
            <span>Mana</span>
            <div style={{ width: 8, height: 8, background: '#D4C68E', borderRadius: '50%', display: 'inline-block', margin: '0 2px' }} />
            <span style={{ fontStyle: 'italic' }}>Map</span>
          </div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9382' }}>
            {verified ? 'Verified · Local Game Store' : 'Local Game Store'}
          </span>
        </div>

        {/* Middle: store name + address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#1A1813', margin: 0, maxWidth: '22ch' }}>
            {name}
          </p>
          {address && (
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A9382', margin: 0 }}>
              {address}
            </p>
          )}
        </div>

        {/* Bottom: pips + domain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {ALL_PIPS.map((color, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: color }} />
            ))}
          </div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9382' }}>
            manamap.gg
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'Newsreader', data: fontData, style: 'italic', weight: 400 }] : [],
    }
  )
}
