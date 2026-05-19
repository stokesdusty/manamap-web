'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { appearances } from '@/db/schema'
import { getCurrentCreator } from '@/lib/auth'

const roleValues = [
  'featured_guest', 'panelist', 'judge', 'competitor',
  'coverage', 'signing', 'booth', 'attendee',
] as const

const schema = z.object({
  eventId: z.number().int().positive(),
  eventSlug: z.string().min(1),
  role: z.enum(roleValues).default('attendee'),
})

export type AddAppearanceResult = { ok: true } | { ok: false; error: string }

export async function addAppearance(
  eventId: number,
  eventSlug: string,
  role: string
): Promise<AddAppearanceResult> {
  const parsed = schema.safeParse({ eventId, eventSlug, role })
  if (!parsed.success) return { ok: false, error: 'Invalid input.' }

  const creator = await getCurrentCreator()
  if (!creator) return { ok: false, error: 'Sign in to add your appearance.' }

  const existing = await db.query.appearances.findFirst({
    where: and(
      eq(appearances.creatorId, creator.id),
      eq(appearances.eventId, parsed.data.eventId)
    ),
    columns: { id: true },
  })
  if (existing) return { ok: false, error: 'You already have an appearance at this event.' }

  await db.insert(appearances).values({
    creatorId: creator.id,
    eventId: parsed.data.eventId,
    role: parsed.data.role,
  })

  revalidatePath(`/event/${parsed.data.eventSlug}`)
  return { ok: true }
}
