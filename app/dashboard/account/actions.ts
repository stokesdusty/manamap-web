'use server'

import { eq } from 'drizzle-orm'
import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/db'
import { bookings, creatorProfiles, users } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'

export type AccountActionResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<string, string[]>> }

export async function deleteAccount(): Promise<AccountActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, errors: { root: ['Not authenticated'] } }

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
    columns: { id: true },
  })

  if (creator) {
    // Delete bookings manually (no cascade on bookings.creatorId)
    await db.delete(bookings).where(eq(bookings.creatorId, creator.id))
    // Delete creator profile (cascades: socialAccounts, featuredContent, creatorFormats,
    // creatorContentTags, appearances, storeCreators)
    await db.delete(creatorProfiles).where(eq(creatorProfiles.id, creator.id))
  }

  await db.delete(users).where(eq(users.id, user.id))

  if (user.clerkId) {
    const client = await clerkClient()
    await client.users.deleteUser(user.clerkId)
  }

  return { ok: true }
}
