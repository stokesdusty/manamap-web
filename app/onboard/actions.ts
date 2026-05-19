'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import {
  contentTags,
  creatorContentTags,
  creatorFormats,
  creatorProfiles,
  formatTags,
  socialAccounts,
} from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'

// ── Shared result type ────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; errors: Partial<Record<string, string[]>> }

// ── Step 1: Display name + URL handle ────────────────────────────────────────

const step1Schema = z.object({
  displayName: z.string().min(1, 'Name is required').max(255),
  handle: z
    .string()
    .min(2, 'At least 2 characters')
    .max(64, 'Max 64 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
})

export async function saveOnboardStep1(
  data: unknown
): Promise<ActionResult> {
  const parsed = step1Schema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  await db
    .update(creatorProfiles)
    .set({ displayName: parsed.data.displayName, slug: parsed.data.handle, handle: parsed.data.handle })
    .where(eq(creatorProfiles.id, creator.id))

  return { ok: true }
}

// ── Step 2: Platform handles ──────────────────────────────────────────────────

const PLATFORM_URL: Record<string, (h: string) => string> = {
  youtube:  (h) => `https://youtube.com/@${h}`,
  twitch:   (h) => `https://twitch.tv/${h}`,
  bluesky:  (h) => `https://bsky.app/profile/${h}`,
  moxfield: (h) => `https://moxfield.com/users/${h}`,
}

const step2Schema = z.object({
  youtube:  z.string().max(255).optional().default(''),
  twitch:   z.string().max(255).optional().default(''),
  bluesky:  z.string().max(255).optional().default(''),
  moxfield: z.string().max(255).optional().default(''),
})

export async function saveOnboardStep2(
  data: unknown
): Promise<ActionResult> {
  const parsed = step2Schema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  await db.delete(socialAccounts).where(eq(socialAccounts.creatorId, creator.id))

  const entries = (
    Object.entries(parsed.data) as Array<[string, string]>
  ).filter(([, h]) => h.trim())

  if (entries.length > 0) {
    await db.insert(socialAccounts).values(
      entries.map(([platform, handle]) => ({
        creatorId: creator.id,
        platform: platform as 'youtube' | 'twitch' | 'bluesky' | 'moxfield',
        handle: handle.trim(),
        url: (PLATFORM_URL[platform] ?? ((h: string) => h))(handle.trim()),
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
  tags:     z.array(z.string()),
  audience: z.array(z.string()),
})

export async function saveOnboardStep3(
  data: unknown
): Promise<ActionResult> {
  const parsed = step3Schema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  const fmtRows = await db
    .select({ id: formatTags.id, code: formatTags.code })
    .from(formatTags)
    .where(sql`${formatTags.code}::text = ANY(${parsed.data.formats}::text[])`)

  const allTagCodes = [...parsed.data.tags, ...parsed.data.audience]
  const tagRows =
    allTagCodes.length > 0
      ? await db
          .select({ id: contentTags.id })
          .from(contentTags)
          .where(inArray(contentTags.code, allTagCodes))
      : []

  await db
    .update(creatorProfiles)
    .set({
      colors: parsed.data.colors as Array<'w' | 'u' | 'b' | 'r' | 'g'>,
      primaryFormatId: fmtRows[0]?.id ?? null,
      primaryContentTagId: tagRows[0]?.id ?? null,
    })
    .where(eq(creatorProfiles.id, creator.id))

  await db.delete(creatorFormats).where(eq(creatorFormats.creatorId, creator.id))
  if (fmtRows.length > 0)
    await db.insert(creatorFormats).values(
      fmtRows.map((f) => ({ creatorId: creator.id, formatId: f.id }))
    )

  await db.delete(creatorContentTags).where(eq(creatorContentTags.creatorId, creator.id))
  if (tagRows.length > 0)
    await db.insert(creatorContentTags).values(
      tagRows.map((t) => ({ creatorId: creator.id, tagId: t.id }))
    )

  return { ok: true }
}

// ── Step 4: Publish ───────────────────────────────────────────────────────────

export async function publishProfile(): Promise<ActionResult<{ slug: string }>> {
  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  await db
    .update(creatorProfiles)
    .set({ verified: true })
    .where(eq(creatorProfiles.id, creator.id))

  revalidatePath(`/c/${creator.slug}`)
  return { ok: true, data: { slug: creator.slug } }
}
