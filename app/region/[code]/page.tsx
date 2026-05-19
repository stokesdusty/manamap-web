import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `${code} MTG Creators`,
    description: `Find local MTG creators and events in ${code} on ManaMap.`,
  }
}

export default async function RegionPage({ params }: Props) {
  const { code } = await params

  // TODO: fetch region + local creators and upcoming events

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Local Scene</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {code}
      </h1>
      <p className="mt-4 text-ink-3">Regional creator and event directory — coming soon.</p>
    </main>
  )
}
