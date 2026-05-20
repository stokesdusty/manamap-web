import type { Metadata } from 'next'
import { getCurrentCreator } from '@/lib/auth'
import { FeaturedForm } from './_components/FeaturedForm'

export const metadata: Metadata = { title: 'Featured Content' }

export default async function DashboardFeaturedPage() {
  const creator = await getCurrentCreator()

  const initial = {
    items: (creator?.featuredContent ?? []).map((fc) => ({
      id:           fc.id,
      platform:     fc.platform as 'youtube' | 'twitch' | 'tiktok' | 'bluesky' | 'twitter' | 'instagram' | 'moxfield' | 'archidekt' | 'podcast' | 'patreon',
      title:        fc.title,
      url:          fc.url ?? '',
      thumbnailUrl: fc.thumbnailUrl ?? '',
    })),
  }

  return (
    <main style={{ background: 'var(--paper)', padding: '24px 28px', minHeight: '100vh' }}>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          letterSpacing: '-0.02em',
          fontWeight: 400,
          margin: '0 0 4px',
        }}
      >
        Featured content
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-3)',
          margin: '0 0 24px',
        }}
      >
        Showcase · Up to 6 items · Drag to reorder
      </p>

      <FeaturedForm initial={initial} />
    </main>
  )
}
