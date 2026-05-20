import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/db'
import { users } from '@/db/schema'

type ClerkEmailAddress = { id: string; email_address: string }
type ClerkUserPayload = {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
}
type ClerkWebhookEvent = {
  type: string
  data: ClerkUserPayload
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Missing svix headers', { status: 400 })
  }

  const body = await req.text()

  let event: ClerkWebhookEvent
  try {
    event = new Webhook(secret).verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const { id: clerkId, email_addresses, primary_email_address_id } = event.data
    const primary = email_addresses.find((e) => e.id === primary_email_address_id)
    if (!primary) {
      return new NextResponse('No primary email found', { status: 400 })
    }

    // Upsert by email — this links a Clerk account to a pre-existing waitlist row
    // or creates a fresh user record.
    await db
      .insert(users)
      .values({ email: primary.email_address, clerkId })
      .onConflictDoUpdate({
        target: [users.email],
        set: { clerkId, updatedAt: new Date() },
      })
  }

  return new NextResponse('OK', { status: 200 })
}
