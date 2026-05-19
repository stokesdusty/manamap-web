import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug,
    description: `MTG creator profile for ${slug} on ManaMap.`,
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const { slug } = await params

  // TODO: fetch creator profile from db where slug = slug
  // if (!creator) notFound()

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Creator</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {slug}
      </h1>
      <p className="mt-4 text-ink-3">Creator profile — coming soon.</p>
    </main>
  )
}
