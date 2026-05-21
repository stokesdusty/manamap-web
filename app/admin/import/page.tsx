import type { Metadata } from 'next'
import { ImportForm } from './_components/ImportForm'

export const metadata: Metadata = { title: 'Import — Admin' }

export default function AdminImportPage() {
  return (
    <div style={{ maxWidth: 860 }}>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 24,
          fontWeight: 400,
          margin: '0 0 6px',
        }}
      >
        Import creators
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--ink-3)',
          margin: '0 0 28px',
          lineHeight: 1.5,
        }}
      >
        Paste a CSV with one creator per row. Existing slugs are updated (upsert). New profiles are
        created with <code style={{ fontFamily: 'var(--font-mono)' }}>published=false</code>. YouTube
        and Twitch accounts are synced inline after import.
      </p>
      <ImportForm />
    </div>
  )
}
