'use server'

import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address.')

export type WaitlistResult = { ok: true } | { ok: false; error: string }

export async function addToWaitlist(email: string): Promise<WaitlistResult> {
  const parsed = emailSchema.safeParse(email.trim().toLowerCase())
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid email.' }
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    // Dev: allow without Resend configured
    console.log('[waitlist] Resend not configured — would add:', parsed.data)
    return { ok: true }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const { error } = await resend.contacts.create({
      email: parsed.data,
      audienceId,
      unsubscribed: false,
    })

    if (error) {
      // Already subscribed counts as success (idempotent UX)
      if ('name' in error && String((error as { name: string }).name).includes('exists')) {
        return { ok: true }
      }
      console.error('[waitlist] Resend error:', error)
      return { ok: false, error: 'Could not add to waitlist. Please try again.' }
    }

    return { ok: true }
  } catch (err) {
    console.error('[waitlist] Unexpected error:', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}
