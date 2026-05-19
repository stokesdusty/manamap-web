import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug,
    description: `Local game store profile for ${slug} on ManaMap.`,
  }
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params

  // TODO: fetch store from db where slug = slug
  // if (!store) notFound()

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Local Game Store</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {slug}
      </h1>
      <p className="mt-4 text-ink-3">Store profile and events — coming soon.</p>
    </main>
  )
}
