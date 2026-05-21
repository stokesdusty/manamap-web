'use server'

import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import {
  creatorProfiles,
  socialAccounts,
  creatorFormats,
  creatorContentTags,
  regions,
  formatTags,
  contentTags,
} from '@/db/schema'
import { syncSocialAccount } from '@/lib/external/sync'
import type { platformEnum } from '@/db/schema'

// ── Row schema ────────────────────────────────────────────────────────────────

const rowSchema = z.object({
  displayName: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  youtube: z.string().optional(),
  twitch: z.string().optional(),
  tiktok: z.string().optional(),
  bluesky: z.string().optional(),
  region: z.string().optional(),
  formats: z.string().optional(),
  contentTags: z.string().optional(),
})

export type ImportRowResult = {
  row: number
  slug: string
  displayName: string
  ok: boolean
  created: boolean
  error?: string
  syncResults: Array<{ platform: string; ok: boolean; followers: number; error?: string }>
}

export type ImportResult = {
  ok: boolean
  results: ImportRowResult[]
  parseError?: string
}

// ── Platform URL builders ─────────────────────────────────────────────────────

function buildSocialUrl(platform: string, handle: string): string {
  switch (platform) {
    case 'youtube': return `https://youtube.com/@${handle}`
    case 'twitch': return `https://twitch.tv/${handle}`
    case 'tiktok': return `https://tiktok.com/@${handle}`
    case 'bluesky': return `https://bsky.app/profile/${handle}`
    default: return ''
  }
}

// ── Simple CSV parser (no quoted field support — admin tool) ──────────────────

function parseCSV(text: string): string[][] {
  return text
    .split('\n')
    .map((line) => line.split(',').map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0))
}

// ── Main action ───────────────────────────────────────────────────────────────

export async function importCreators(
  _prev: ImportResult | null,
  formData: FormData
): Promise<ImportResult> {
  const csv = (formData.get('csv') as string | null) ?? ''
  if (!csv.trim()) {
    return { ok: false, results: [], parseError: 'No data provided.' }
  }

  const rows = parseCSV(csv)
  if (rows.length === 0) {
    return { ok: false, results: [], parseError: 'Could not parse any rows.' }
  }

  // Detect header row
  const firstRow = rows[0]
  const hasHeader =
    firstRow.some((c) => c.toLowerCase() === 'displayname') ||
    firstRow.some((c) => c.toLowerCase() === 'slug')
  const dataRows = hasHeader ? rows.slice(1) : rows

  if (dataRows.length === 0) {
    return { ok: false, results: [], parseError: 'No data rows found (only a header).' }
  }

  // Prefetch reference data
  const [regionRows, formatRows, tagRows] = await Promise.all([
    db.select().from(regions),
    db.select().from(formatTags),
    db.select().from(contentTags),
  ])

  const regionByCode = Object.fromEntries(regionRows.map((r) => [r.code, r]))
  const formatByCode = Object.fromEntries(formatRows.map((f) => [f.code, f]))
  const tagByCode = Object.fromEntries(tagRows.map((t) => [t.code, t]))

  const results: ImportRowResult[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const [
      displayName = '',
      slug = '',
      youtube = '',
      twitch = '',
      tiktok = '',
      bluesky = '',
      region = '',
      formatsRaw = '',
      contentTagsRaw = '',
    ] = dataRows[i]

    const rowResult: ImportRowResult = {
      row: i + (hasHeader ? 2 : 1),
      slug: slug || '(unknown)',
      displayName: displayName || '(unknown)',
      ok: false,
      created: false,
      syncResults: [],
    }

    const parsed = rowSchema.safeParse({
      displayName,
      slug,
      youtube: youtube || undefined,
      twitch: twitch || undefined,
      tiktok: tiktok || undefined,
      bluesky: bluesky || undefined,
      region: region || undefined,
      formats: formatsRaw || undefined,
      contentTags: contentTagsRaw || undefined,
    })

    if (!parsed.success) {
      rowResult.error = parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
      results.push(rowResult)
      continue
    }

    const data = parsed.data

    try {
      // Resolve optional FK references
      const regionId = data.region ? (regionByCode[data.region]?.id ?? null) : null

      const formatCodes = data.formats
        ? data.formats.split('|').map((s) => s.trim()).filter(Boolean)
        : []
      const tagCodes = data.contentTags
        ? data.contentTags.split('|').map((s) => s.trim()).filter(Boolean)
        : []

      const primaryFormatId = formatCodes.length > 0 ? (formatByCode[formatCodes[0]]?.id ?? null) : null
      const primaryContentTagId = tagCodes.length > 0 ? (tagByCode[tagCodes[0]]?.id ?? null) : null

      // Upsert creator profile
      const existing = await db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.slug, data.slug),
        columns: { id: true },
      })

      let profileId: number

      if (existing) {
        await db
          .update(creatorProfiles)
          .set({
            displayName: data.displayName,
            regionId,
            primaryFormatId,
            primaryContentTagId,
            updatedAt: new Date(),
          })
          .where(eq(creatorProfiles.id, existing.id))
        profileId = existing.id
        rowResult.created = false
      } else {
        const [created] = await db
          .insert(creatorProfiles)
          .values({
            slug: data.slug,
            displayName: data.displayName,
            regionId,
            primaryFormatId,
            primaryContentTagId,
            published: false,
          })
          .returning({ id: creatorProfiles.id })
        profileId = created.id
        rowResult.created = true
      }

      // Replace formats junction
      if (formatCodes.length > 0) {
        const validFormats = formatCodes
          .map((code) => formatByCode[code])
          .filter(Boolean)
        if (validFormats.length > 0) {
          await db.delete(creatorFormats).where(eq(creatorFormats.creatorId, profileId))
          await db.insert(creatorFormats).values(
            validFormats.map((f) => ({ creatorId: profileId, formatId: f.id }))
          )
        }
      }

      // Replace content tags junction
      if (tagCodes.length > 0) {
        const validTags = tagCodes
          .map((code) => tagByCode[code])
          .filter(Boolean)
        if (validTags.length > 0) {
          await db.delete(creatorContentTags).where(eq(creatorContentTags.creatorId, profileId))
          await db.insert(creatorContentTags).values(
            validTags.map((t) => ({ creatorId: profileId, tagId: t.id }))
          )
        }
      }

      // Upsert social accounts and collect IDs for sync
      const platforms: Array<{ platform: (typeof platformEnum.enumValues)[number]; handle: string }> = []
      if (data.youtube) platforms.push({ platform: 'youtube', handle: data.youtube })
      if (data.twitch) platforms.push({ platform: 'twitch', handle: data.twitch })
      if (data.tiktok) platforms.push({ platform: 'tiktok', handle: data.tiktok })
      if (data.bluesky) platforms.push({ platform: 'bluesky', handle: data.bluesky })

      const syncIds: number[] = []

      for (const { platform, handle } of platforms) {
        const url = buildSocialUrl(platform, handle)
        const [existingAccount] = await db
          .select({ id: socialAccounts.id })
          .from(socialAccounts)
          .where(
            and(
              eq(socialAccounts.creatorId, profileId),
              eq(socialAccounts.platform, platform)
            )
          )
          .limit(1)

        if (existingAccount) {
          await db
            .update(socialAccounts)
            .set({ handle, url, updatedAt: new Date() })
            .where(eq(socialAccounts.id, existingAccount.id))
          syncIds.push(existingAccount.id)
        } else {
          const [newAcct] = await db
            .insert(socialAccounts)
            .values({ creatorId: profileId, platform, handle, url, followers: 0 })
            .returning({ id: socialAccounts.id })
          syncIds.push(newAcct.id)
        }
      }

      // Sync YouTube + Twitch accounts sequentially with 250ms delay
      for (const socialId of syncIds) {
        const syncResult = await syncSocialAccount(socialId)
        if (syncResult.platform === 'youtube' || syncResult.platform === 'twitch') {
          rowResult.syncResults.push(syncResult)
          await new Promise((r) => setTimeout(r, 250))
        }
      }

      rowResult.ok = true
    } catch (err) {
      rowResult.error = err instanceof Error ? err.message : 'Unknown error'
    }

    results.push(rowResult)
  }

  return { ok: true, results }
}
