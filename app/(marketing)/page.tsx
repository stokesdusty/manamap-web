import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ManaMap — The MTG Creator Directory',
  description:
    'Find MTG creators by format, content style, audience, and region.',
}

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="t-eyebrow mb-4">The directory for MTG creators</p>
        <h1
          className="font-serif text-ink"
          style={{ fontSize: 'var(--text-h1)', letterSpacing: 'var(--ls-h1)', lineHeight: 1.05 }}
        >
          Find the people behind<br />
          <em>the format you love.</em>
        </h1>
        <p className="mt-6 text-ink-3" style={{ fontSize: 'var(--text-body-lg)', maxWidth: '52ch' }}>
          Search creators by format, content style, audience, and region.
          See where they&apos;re streaming, posting, and showing up next.
        </p>

        {/* Search bar — placeholder */}
        <div
          className="mt-10 flex items-center gap-3 bg-surface border border-hairline px-4 py-3"
          style={{ borderRadius: 'var(--r-lg)' }}
        >
          <span className="flex-1 text-ink-4" style={{ fontSize: 'var(--text-body-lg)' }}>
            Find a creator, format, or city…
          </span>
          <button
            className="bg-ink text-surface px-5 py-2 font-sans font-medium"
            style={{ borderRadius: 'var(--r-pill)', fontSize: 'var(--text-body)' }}
          >
            Search
          </button>
        </div>

        {/* WUBRG color filter chips — placeholder */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="t-label">Filter by color:</span>
          {(['w', 'u', 'b', 'r', 'g'] as const).map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 border border-hairline px-3 py-1 cursor-pointer hover:border-hairline-strong transition-colors"
              style={{ borderRadius: 'var(--r-pill)', fontSize: 'var(--text-body-sm)' }}
            >
              <span className={`pip pip-${c}`} />
              {{ w: 'White', u: 'Blue', b: 'Black', r: 'Red', g: 'Green' }[c]}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
