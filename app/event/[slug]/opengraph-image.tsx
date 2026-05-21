import { ImageResponse } from 'next/og'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { events } from '@/db/schema'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MTG event on ManaMap'

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

const KIND_LABEL: Record<string, string> = {
  convention:  'Convention',
  commandfest: 'CommandFest',
  rcq:         'Regional Championship Qualifier',
  grand_prix:  'Grand Prix',
  prerelease:  'Prerelease',
  fnm:         'Friday Night Magic',
  local:       'Local Event',
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

type Props = { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params

  const [event, fontData] = await Promise.all([
    db.query.events.findFirst({
      where: eq(events.slug, slug),
      columns: { name: true, startDate: true, locationName: true, kind: true },
    }),
    loadNewsreader(),
  ])

  const name = event?.name ?? 'MTG Event'
  const kindLabel = KIND_LABEL[event?.kind ?? ''] ?? 'Event'
  const dateStr = event ? fmtDate(event.startDate) : ''
  const meta = [kindLabel, dateStr, event?.locationName].filter(Boolean).join(' · ')
  const fontSize = name.length > 36 ? 48 : name.length > 24 ? 58 : 68

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1813',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 80px',
          justifyContent: 'space-between',
          fontFamily: fontData ? '"Newsreader"' : 'Georgia, serif',
        }}
      >
        {/* Top: wordmark (inverted) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, color: '#F5F1E8', letterSpacing: '-0.01em' }}>
            <span>Mana</span>
            <div style={{ width: 8, height: 8, background: '#D4C68E', borderRadius: '50%', display: 'inline-block', margin: '0 2px' }} />
            <span style={{ fontStyle: 'italic' }}>Map</span>
          </div>
          <span style={{ fontFamily: '"Courier New", monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9382' }}>
            {kindLabel}
          </span>
        </div>

        {/* Middle: event name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#F5F1E8', margin: 0, maxWidth: '22ch' }}>
            {name}
          </p>
          {meta && (
            <p style={{ fontFamily: '"Courier New", monospace', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A9382', margin: 0 }}>
              {meta}
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
