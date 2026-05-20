import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users, creatorProfiles } from '@/db/schema'

export async function getCurrentCreator() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) return null

  return db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
    with: {
      region: true,
      primaryFormat: { columns: { id: true, code: true, name: true, colors: true } },
      formats: { with: { format: { columns: { id: true, code: true, name: true } } } },
      contentTags: { with: { tag: { columns: { id: true, code: true, kind: true, label: true } } } },
      socialAccounts: { columns: { id: true, platform: true, handle: true, url: true, followers: true } },
    },
  })
}

export type CurrentCreator = NonNullable<Awaited<ReturnType<typeof getCurrentCreator>>>
