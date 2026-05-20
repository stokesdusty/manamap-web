import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { contentTags, formatTags } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'
import { TagsForm } from './_components/TagsForm'

export const metadata: Metadata = { title: 'Tags' }

export default async function DashboardTagsPage() {
  const [creator, fmtRows, tagRows] = await Promise.all([
    getCurrentCreator(),
    db.query.formatTags.findMany({ orderBy: [asc(formatTags.name)] }),
    db.query.contentTags.findMany({ orderBy: [asc(contentTags.label)] }),
  ])

  const allFormats   = fmtRows.map((f) => ({ code: f.code, name: f.name }))
  const styleTags    = tagRows.filter((t) => t.kind === 'style' || t.kind === 'theme').map((t) => ({ code: t.code, label: t.label }))
  const audienceTags = tagRows.filter((t) => t.kind === 'audience').map((t) => ({ code: t.code, label: t.label }))

  const initial = creator
    ? {
        formats:  creator.formats.map((f) => f.format.code),
        colors:   creator.colors,
        tags:     creator.contentTags.filter((ct) => ct.tag.kind === 'style' || ct.tag.kind === 'theme').map((ct) => ct.tag.code),
        audience: creator.contentTags.filter((ct) => ct.tag.kind === 'audience').map((ct) => ct.tag.code),
      }
    : { formats: [], colors: [], tags: [], audience: [] }

  return (
    <main style={{ background: 'var(--paper)', padding: '24px 28px', minHeight: '100vh' }}>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          letterSpacing: '-0.02em',
          fontWeight: 400,
          margin: '0 0 4px',
        }}
      >
        Tags
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--ink-3)',
          margin: '0 0 24px',
        }}
      >
        Discoverability · Format, colors, content type, audience
      </p>

      <TagsForm
        initial={initial}
        allFormats={allFormats}
        styleTags={styleTags}
        audienceTags={audienceTags}
      />
    </main>
  )
}
