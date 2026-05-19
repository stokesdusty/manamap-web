import type { Metadata } from 'next'
import { z } from 'zod'

export const metadata: Metadata = {
  title: 'Search Creators',
  description: 'Search MTG creators by format, content style, audience, and region.',
}

const searchParamsSchema = z.object({
  q: z.string().optional(),
  formats: z.string().optional(),
  tags: z.string().optional(),
  region: z.string().optional(),
  sort: z.enum(['followers', 'alpha']).optional().default('followers'),
})

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: Props) {
  const raw = await searchParams
  const parsed = searchParamsSchema.safeParse(raw)
  const filters = parsed.success ? parsed.data : { q: undefined, sort: 'followers' as const }

  // TODO: query db with Postgres FTS + facet filters

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1
        className="font-serif text-ink mb-8"
        style={{ fontSize: 'var(--text-h3)', letterSpacing: 'var(--ls-h3)' }}
      >
        {filters.q ? `Results for "${filters.q}"` : 'Discover creators'}
      </h1>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className="w-56 shrink-0">
          <p className="t-label mb-4">Filters</p>
          <p className="text-ink-4" style={{ fontSize: 'var(--text-body-sm)' }}>
            Format, tags, region — coming soon.
          </p>
        </aside>

        {/* Results grid */}
        <section className="flex-1">
          <p className="t-label mb-4">Creators</p>
          <p className="text-ink-3" style={{ fontSize: 'var(--text-body)' }}>
            Search results — coming soon.
          </p>
        </section>
      </div>
    </main>
  )
}
