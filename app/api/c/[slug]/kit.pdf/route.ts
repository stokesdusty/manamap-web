import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { creatorProfiles } from '@/db/schema'

// Allow up to 60s — PDF generation is slow on cold start
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// ── Chrome path resolution ────────────────────────────────────────────────────

function localChromePath(): string {
  if (process.platform === 'win32') {
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  }
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
  return '/usr/bin/google-chrome-stable'
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Validate creator exists before spinning up a browser
  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.slug, slug),
    columns: { displayName: true },
  })
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '')

  const kitUrl = `${baseUrl}/c/${slug}/kit`

  // Dynamic import keeps Chromium out of the main bundle
  const puppeteer = (await import('puppeteer-core')).default

  let executablePath: string
  let launchArgs: string[]

  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    // Explicit path — works in CI, Vercel with custom layer, or local dev
    executablePath = process.env.CHROMIUM_EXECUTABLE_PATH
    launchArgs = ['--no-sandbox', '--disable-setuid-sandbox']
  } else if (process.env.NODE_ENV === 'production') {
    // Vercel serverless — use @sparticuz/chromium
    const chromium = (await import('@sparticuz/chromium')).default
    executablePath = await chromium.executablePath()
    launchArgs = chromium.args
  } else {
    // Local dev — detect system Chrome
    executablePath = localChromePath()
    launchArgs = ['--no-sandbox', '--disable-setuid-sandbox']
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined

  try {
    browser = await puppeteer.launch({
      executablePath,
      args: launchArgs,
      headless: true,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 900 })

    await page.goto(kitUrl, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    })

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready')

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,       // the 2-col kit reads best landscape
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    const filename = `${slug}-media-kit.pdf`

    // puppeteer returns Uint8Array<ArrayBufferLike>; cast buffer for Blob constructor
    const blob = new Blob([pdf.buffer as ArrayBuffer], { type: 'application/pdf' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[kit.pdf] generation failed:', err)
    return NextResponse.json(
      { error: 'PDF generation failed. Ensure a Chromium-compatible browser is available.' },
      { status: 500 }
    )
  } finally {
    await browser?.close()
  }
}
