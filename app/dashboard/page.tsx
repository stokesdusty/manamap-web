import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  // TODO: protect with Clerk auth — redirect unauthenticated users

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="t-eyebrow mb-2">Dashboard</p>
      <h1
        className="font-serif text-ink"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--ls-h2)' }}
      >
        Your profile
      </h1>
      <p className="mt-4 text-ink-3">Creator / store dashboard — coming soon.</p>
    </main>
  )
}
