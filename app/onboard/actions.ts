'use server'

import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { getCurrentUser } from '@/lib/auth'
import {
  contentTags,
  creatorContentTags,
  creatorFormats,
  creatorProfiles,
  formatTags,
  socialAccounts,
} from '@/db/schema'

// ── Shared result type ────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; errors: Partial<Record<string, string[]>> }

// ── Step 1: Display name + URL handle ────────────────────────────────────────

const HANDLE_REGEX = /^[a-z0-9-]{3,32}$/

export const SLUG_DENYLIST = new Set([
  'search', 'dashboard', 'onboard', 'sign-in', 'sign-up', 'c', 'event',
  'store', 'format', 'tag', 'region', 'api', 'admin', 'kit', 'about',
  'contact', 'terms', 'privacy',
])

const step1Schema = z.object({
  displayName: z.string().min(1, 'Name is required').max(255),
  handle: z
    .string()
    .regex(HANDLE_REGEX, 'Lowercase letters, numbers, and hyphens — 3 to 32 characters'),
})

export async function checkHandleAvailability(
  handle: string
): Promise<{ available: boolean; message?: string }> {
  if (!HANDLE_REGEX.test(handle)) return { available: false, message: 'Invalid format' }
  if (SLUG_DENYLIST.has(handle)) return { available: false, message: 'That handle is reserved' }

  const existing = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.slug, handle),
    columns: { id: true, userId: true },
  })
  if (!existing) return { available: true }

  // Allow if it's the current user's own profile
  const user = await getCurrentUser()
  if (user && existing.userId === user.id) return { available: true }

  return { available: false, message: 'Handle already taken' }
}

export async function saveOnboardStep1(data: unknown): Promise<ActionResult> {
  const parsed = step1Schema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const { displayName, handle } = parsed.data

  if (SLUG_DENYLIST.has(handle))
    return { ok: false, errors: { handle: ['That handle is reserved'] } }

  const user = await getCurrentUser()
  if (!user) return { ok: false, errors: { root: ['Not authenticated'] } }

  // Uniqueness check — allow the current user to keep their own handle
  const taken = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.slug, handle),
    columns: { id: true, userId: true },
  })
  if (taken && taken.userId !== user.id)
    return { ok: false, errors: { handle: ['Handle already taken'] } }

  // Upsert: update existing profile or create one
  const existing = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
    columns: { id: true },
  })

  if (existing) {
    await db
      .update(creatorProfiles)
      .set({ displayName, slug: handle, handle, updatedAt: new Date() })
      .where(eq(creatorProfiles.id, existing.id))
  } else {
    await db.insert(creatorProfiles).values({ userId: user.id, slug: handle, handle, displayName })
  }

  return { ok: true }
}

// ── Step 2: Platform handles ──────────────────────────────────────────────────

const PLATFORM_URL: Record<string, (h: string) => string> = {
  youtube:  (h) => `https://youtube.com/@${h}`,
  twitch:   (h) => `https://twitch.tv/${h}`,
  tiktok:   (h) => `https://tiktok.com/@${h}`,
  bluesky:  (h) => `https://bsky.app/profile/${h}`,
  twitter:  (h) => `https://x.com/${h}`,
  patreon:  (h) => `https://patreon.com/${h}`,
  moxfield: (h) => `https://moxfield.com/users/${h}`,
}

// Regex matches empty string OR a valid handle — making each field truly optional
const h = (pattern: string, msg: string) =>
  z.string().max(100).regex(new RegExp(`^(|${pattern})$`), msg).default('')

const step2Schema = z.object({
  youtube:  h('[a-zA-Z0-9_.-]{1,100}',  'Invalid YouTube handle'),
  twitch:   h('[a-zA-Z0-9_]{4,25}',     'Twitch: 4–25 alphanumeric or underscore'),
  tiktok:   h('[a-zA-Z0-9_.]{1,24}',    'Invalid TikTok handle'),
  bluesky:  h('[a-zA-Z0-9.-]{1,100}',   'Invalid Bluesky handle'),
  twitter:  h('[a-zA-Z0-9_]{1,15}',     'X: up to 15 alphanumeric or underscore'),
  patreon:  h('[a-zA-Z0-9_-]{1,100}',   'Invalid Patreon handle'),
  moxfield: h('[a-zA-Z0-9_-]{1,100}',   'Invalid Moxfield handle'),
})

export async function saveOnboardStep2(data: unknown): Promise<ActionResult> {
  const parsed = step2Schema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const user = await getCurrentUser()
  if (!user) return { ok: false, errors: { root: ['Not authenticated'] } }

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
    columns: { id: true },
  })
  if (!creator) return { ok: false, errors: { root: ['Complete step 1 first'] } }

  await db.delete(socialAccounts).where(eq(socialAccounts.creatorId, creator.id))

  const entries = (Object.entries(parsed.data) as [string, string][]).filter(([, h]) => h.trim())

  if (entries.length > 0) {
    await db.insert(socialAccounts).values(
      entries.map(([platform, handle]) => ({
        creatorId: creator.id,
        platform: platform as 'youtube' | 'twitch' | 'tiktok' | 'bluesky' | 'twitter' | 'patreon' | 'moxfield',
        handle: handle.trim(),
        url: (PLATFORM_URL[platform] ?? ((v: string) => v))(handle.trim()),
        followers: 0,
      }))
    )
  }

  return { ok: true }
}

// ── Step 3: Formats, colors, content tags, audience ──────────────────────────

const step3Schema = z.object({
  formats:  z.array(z.string()).min(1, 'Pick at least one format'),
  colors:   z.array(z.string()),
  tags:     z.array(z.string()).min(1, 'Pick at least one content type'),
  audience: z.array(z.string()),
})

export async function saveOnboardStep3(data: unknown): Promise<ActionResult> {
  const parsed = step3Schema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const user = await getCurrentUser()
  if (!user) return { ok: false, errors: { root: ['Not authenticated'] } }

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
    columns: { id: true },
  })
  if (!creator) return { ok: false, errors: { root: ['Complete step 1 first'] } }

  const fmtRows = await db
    .select({ id: formatTags.id, code: formatTags.code })
    .from(formatTags)
    .where(sql`${formatTags.code}::text = ANY(${parsed.data.formats}::text[])`)

  if (fmtRows.length === 0)
    return { ok: false, errors: { formats: ['No valid formats selected'] } }

  const allTagCodes = [...parsed.data.tags, ...parsed.data.audience]
  const tagRows = allTagCodes.length > 0
    ? await db.select({ id: contentTags.id, code: contentTags.code }).from(contentTags).where(inArray(contentTags.code, allTagCodes))
    : []

  const styleTagIds = tagRows.filter((t) => parsed.data.tags.includes(t.code))
  if (styleTagIds.length === 0)
    return { ok: false, errors: { tags: ['Pick at least one content type'] } }

  await db
    .update(creatorProfiles)
    .set({
      colors: parsed.data.colors as Array<'w' | 'u' | 'b' | 'r' | 'g'>,
      primaryFormatId: fmtRows[0]!.id,
      primaryContentTagId: tagRows[0]?.id ?? null,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.id, creator.id))

  await db.delete(creatorFormats).where(eq(creatorFormats.creatorId, creator.id))
  await db.insert(creatorFormats).values(fmtRows.map((f) => ({ creatorId: creator.id, formatId: f.id })))

  await db.delete(creatorContentTags).where(eq(creatorContentTags.creatorId, creator.id))
  if (tagRows.length > 0)
    await db.insert(creatorContentTags).values(tagRows.map((t) => ({ creatorId: creator.id, tagId: t.id })))

  return { ok: true }
}

// ── Step 4: Publish ───────────────────────────────────────────────────────────

export async function publishProfile(): Promise<ActionResult<{ slug: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, errors: { root: ['Not authenticated'] } }

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
    with: { formats: true },
  })
  if (!creator) return { ok: false, errors: { root: ['Complete step 1 first'] } }
  if (!creator.formats.length) return { ok: false, errors: { root: ['Select at least one format first'] } }

  await db
    .update(creatorProfiles)
    .set({ published: true, updatedAt: new Date() })
    .where(eq(creatorProfiles.id, creator.id))

  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath(`/c/${creator.slug}`)
  revalidatePath('/format/[code]', 'page')

  return { ok: true, data: { slug: creator.slug } }
}
