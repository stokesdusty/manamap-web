import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Media Kit — ${slug}`,
    description: `Public media kit for ${slug}. Audience stats, platform links, and booking info.`,
  }
}

export default async function MediaKitPage({ params }: Props) {
  const { slug } = await params

  // TODO: fetch creator + media kit data

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Media Kit</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {slug}
      </h1>
      <p className="mt-4 text-ink-3">Sponsor-facing media kit — coming soon.</p>
    </main>
  )
}
