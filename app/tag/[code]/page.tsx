import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `${code} MTG Creators`,
    description: `Find MTG creators tagged with "${code}" on ManaMap.`,
  }
}

export default async function TagPage({ params }: Props) {
  const { code } = await params

  // TODO: fetch contentTag + creators with this tag

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Tag</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {code}
      </h1>
      <p className="mt-4 text-ink-3">Tag landing page — coming soon.</p>
    </main>
  )
}
