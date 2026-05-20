'use server'

import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import {
  contentTags,
  creatorContentTags,
  creatorFormats,
  creatorProfiles,
  formatTags,
} from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<string, string[]>> }

const optUrl = z.union([z.literal(''), z.string().max(2048).url()])

const serverSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(255),
  handle: z
    .string()
    .min(2, 'At least 2 characters')
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  bio:        z.string().max(280, 'Max 280 characters'),
  websiteUrl: optUrl,
  avatarUrl:  optUrl,
  bannerUrl:  optUrl,
  regionId: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable().optional()
  ),
  formats:  z.array(z.string()).min(1, 'Pick at least one format'),
  colors:   z.array(z.string()),
  tags:     z.array(z.string()),
  audience: z.array(z.string()),
})

export async function saveProfile(data: unknown): Promise<ProfileActionResult> {
  const parsed = serverSchema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  const fmtRows = await db
    .select({ id: formatTags.id })
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
      displayName:         parsed.data.displayName,
      slug:                parsed.data.handle,
      handle:              parsed.data.handle,
      bio:                 parsed.data.bio || null,
      websiteUrl:          parsed.data.websiteUrl || null,
      avatarUrl:           parsed.data.avatarUrl || null,
      bannerUrl:           parsed.data.bannerUrl || null,
      regionId:            parsed.data.regionId ?? null,
      colors:              parsed.data.colors as Array<'w' | 'u' | 'b' | 'r' | 'g'>,
      primaryFormatId:     fmtRows[0]?.id ?? null,
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

  revalidatePath(`/c/${parsed.data.handle}`)
  revalidatePath('/dashboard/profile')
  return { ok: true }
}
