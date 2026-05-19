import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const label = code.toUpperCase()
  return {
    title: `Best ${label} Creators`,
    description: `Discover the top ${label} Magic: The Gathering creators on ManaMap.`,
  }
}

export default async function FormatPage({ params }: Props) {
  const { code } = await params

  // TODO: fetch formatTag + top creators for this format

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Format</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {code.toUpperCase()} Creators
      </h1>
      <p className="mt-4 text-ink-3">Format landing page — coming soon.</p>
    </main>
  )
}
