import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug,
    description: `Event details and creator appearances for ${slug}.`,
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params

  // TODO: fetch event from db where slug = slug
  // if (!event) notFound()

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Event</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        {slug}
      </h1>
      <p className="mt-4 text-ink-3">Event details and creator appearances — coming soon.</p>
    </main>
  )
}
