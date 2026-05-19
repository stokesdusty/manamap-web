import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { contentTags, formatTags } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'
import { OnboardFlow } from './_components/OnboardFlow'

export const metadata: Metadata = { title: 'Set up your profile' }

export default async function OnboardPage() {
  const [creator, fmtRows, tagRows] = await Promise.all([
    getCurrentCreator(),
    db.query.formatTags.findMany({ orderBy: [asc(formatTags.name)] }),
    db.query.contentTags.findMany({ orderBy: [asc(contentTags.label)] }),
  ])

  const allFormats = fmtRows.map((f) => ({ code: f.code, name: f.name }))
  const styleTags = tagRows
    .filter((t) => t.kind === 'style' || t.kind === 'theme')
    .map((t) => ({ code: t.code, label: t.label }))
  const audienceTags = tagRows
    .filter((t) => t.kind === 'audience')
    .map((t) => ({ code: t.code, label: t.label }))

  // Pre-fill from existing creator data (empty if unauthenticated)
  const initial = creator
    ? {
        displayName: creator.displayName,
        handle: creator.handle ?? creator.slug,
        youtube:  creator.socialAccounts.find((s) => s.platform === 'youtube')?.handle  ?? '',
        twitch:   creator.socialAccounts.find((s) => s.platform === 'twitch')?.handle   ?? '',
        bluesky:  creator.socialAccounts.find((s) => s.platform === 'bluesky')?.handle  ?? '',
        moxfield: creator.socialAccounts.find((s) => s.platform === 'moxfield')?.handle ?? '',
        formats:  creator.formats.map((f) => f.format.code),
        colors:   creator.colors,
        tags:     creator.contentTags
          .filter((ct) => ct.tag.kind === 'style' || ct.tag.kind === 'theme')
          .map((ct) => ct.tag.code),
        audience: creator.contentTags
          .filter((ct) => ct.tag.kind === 'audience')
          .map((ct) => ct.tag.code),
      }
    : {}

  return (
    <OnboardFlow
      initial={initial}
      allFormats={allFormats}
      styleTags={styleTags}
      audienceTags={audienceTags}
    />
  )
}
