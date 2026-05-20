import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'ManaMap — The directory for MTG creators'

// WUBRG pip colors
const PIPS = ['#D4C68E', '#3F6FA8', '#2C2730', '#BF5142', '#5C8A5A'] as const

async function loadNewsreader(): Promise<ArrayBuffer | null> {
  try {
    // Fetch the CSS to extract the actual woff2 URL (edge-safe)
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@1,6..72,400&display=swap',
      {
        headers: {
          // Chromium UA so Google Fonts returns woff2
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    ).then((r) => r.text())

    const url = css.match(/src: url\((.+?\.woff2)\)/)?.[1]
    if (!url) return null
    return fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function OGImage() {
  const fontData = await loadNewsreader()

  return new ImageResponse(
    (
      <div
        style={{
          background: '#F5F1E8',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          justifyContent: 'space-between',
          fontFamily: fontData ? '"Newsreader"' : 'Georgia, serif',
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 24,
            color: '#1A1813',
            letterSpacing: '-0.01em',
          }}
        >
          <span>Mana</span>
          <span
            style={{
              width: 8,
              height: 8,
              background: '#D4C68E',
              borderRadius: '50%',
              display: 'inline-block',
              margin: '0 2px',
            }}
          />
          <span style={{ fontStyle: 'italic' }}>Map</span>
        </div>

        {/* H1 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          <p
            style={{
              fontSize: 80,
              fontStyle: 'italic',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: '#1A1813',
              margin: 0,
              maxWidth: '12ch',
            }}
          >
            The directory for{' '}
            <span style={{ color: '#3D3830' }}>MTG creators.</span>
          </p>
        </div>

        {/* Footer: pips + tagline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {PIPS.map((color, i) => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: color,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#9A9382',
            }}
          >
            manamap.gg
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Newsreader', data: fontData, style: 'italic', weight: 400 }]
        : [],
    }
  )
}
