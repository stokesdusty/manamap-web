import { ImageResponse } from 'next/og'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles } from '@/db/schema'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MTG Creator profile on ManaMap'

const WUBRG = { w: '#D4C68E', u: '#3F6FA8', b: '#2C2730', r: '#BF5142', g: '#5C8A5A' }
const ALL_PIPS = Object.values(WUBRG)

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

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

type Props = { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params

  const [creator, fontData] = await Promise.all([
    db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.slug, slug),
      columns: { displayName: true, handle: true, followersTotal: true },
      with: { primaryFormat: { columns: { colors: true } } },
    }),
    loadNewsreader(),
  ])

  const name = creator?.displayName ?? 'MTG Creator'
  const handle = creator?.handle ?? slug
  const followers = creator?.followersTotal ?? 0
  const colors = (creator?.primaryFormat?.colors ?? []) as Array<keyof typeof WUBRG>
  const pips = colors.length > 0 ? colors.map((c) => WUBRG[c] ?? '#9A9382') : ALL_PIPS
  const fontSize = name.length > 24 ? 58 : name.length > 16 ? 68 : 80

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
        {/* Top: wordmark + category label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, color: '#1A1813', letterSpacing: '-0.01em' }}>
            <span>Mana</span>
            <div style={{ width: 8, height: 8, background: '#D4C68E', borderRadius: '50%', display: 'inline-block', margin: '0 2px' }} />
            <span style={{ fontStyle: 'italic' }}>Map</span>
          </div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9382' }}>
            MTG Creator
          </span>
        </div>

        {/* Middle: creator name + handle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize, fontStyle: 'italic', lineHeight: 1.02, letterSpacing: '-0.03em', color: '#1A1813', margin: 0 }}>
            {name}
          </p>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A9382', margin: 0 }}>
            @{handle}
            {followers > 0 ? ` · ${fmtCount(followers)} followers` : ''}
          </p>
        </div>

        {/* Bottom: pips + domain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {pips.map((color, i) => (
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
