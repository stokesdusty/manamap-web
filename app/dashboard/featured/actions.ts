'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { featuredContent } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'

export type FeaturedActionResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<string, string[]>> }

const PLATFORMS = ['youtube', 'twitch', 'tiktok', 'bluesky', 'twitter', 'instagram', 'moxfield', 'archidekt', 'podcast', 'patreon'] as const

const itemSchema = z.object({
  id:           z.number().optional(),
  platform:     z.enum(PLATFORMS, { error: 'Select a platform' }),
  title:        z.string().min(1, 'Title is required').max(255),
  url:          z.string().url('Enter a valid URL (https://…)').max(2048),
  thumbnailUrl: z.union([z.literal(''), z.string().max(2048).url('Enter a valid URL')]),
})

const featuredSchema = z.object({
  items: z.array(itemSchema).max(6, 'Max 6 featured items'),
})

export type FeaturedFormValues = z.infer<typeof featuredSchema>
export type FeaturedItemValues = z.infer<typeof itemSchema>

export async function saveFeatured(data: unknown): Promise<FeaturedActionResult> {
  const parsed = featuredSchema.safeParse(data)
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, errors: { root: ['Not authenticated'] } }

  await db.delete(featuredContent).where(eq(featuredContent.creatorId, creator.id))

  if (parsed.data.items.length > 0) {
    await db.insert(featuredContent).values(
      parsed.data.items.map((item, i) => ({
        creatorId:    creator.id,
        platform:     item.platform,
        title:        item.title,
        url:          item.url,
        externalId:   item.url.slice(0, 255),
        thumbnailUrl: item.thumbnailUrl || null,
        sortOrder:    i,
      }))
    )
  }

  revalidatePath(`/c/${creator.slug}`)
  revalidatePath('/dashboard/featured')
  return { ok: true }
}
