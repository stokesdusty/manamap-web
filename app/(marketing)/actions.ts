'use server'

import { z } from 'zod'
import { headers } from 'next/headers'

const emailSchema = z.string().email('Please enter a valid email address.')

export type WaitlistSource = 'hero' | 'final_cta' | 'footer'

export interface WaitlistInput {
  email: string
  source: WaitlistSource
  honeypot?: string
}

export type WaitlistResult = { ok: true } | { ok: false; error: string }

export async function addToWaitlist({
  email,
  source,
  honeypot,
}: WaitlistInput): Promise<WaitlistResult> {
  // Silently drop bot submissions without revealing the trap
  if (honeypot) return { ok: true }

  const parsed = emailSchema.safeParse(email.trim().toLowerCase())
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid email.' }
  }

  // Rate-limit by IP (5 signups per minute per IP)
  const rateLimitResult = await checkRateLimit()
  if (!rateLimitResult.allowed) {
    return { ok: false, error: "We couldn't add that — try again?" }
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    // Dev: allow without Resend configured
    console.log('[waitlist] Resend not configured — would add:', parsed.data, 'source:', source)
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
      return { ok: false, error: "We couldn't add that — try again?" }
    }

    return { ok: true }
  } catch (err) {
    console.error('[waitlist] Unexpected error:', err)
    return { ok: false, error: "We couldn't add that — try again?" }
  }
}

async function checkRateLimit(): Promise<{ allowed: boolean }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return { allowed: true }

  try {
    const { Redis } = await import('@upstash/redis')
    const { Ratelimit } = await import('@upstash/ratelimit')

    const redis = new Redis({ url, token })
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'waitlist',
    })

    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'

    const { success } = await ratelimit.limit(ip)
    return { allowed: success }
  } catch (err) {
    // If rate-limit check fails, allow through and log
    console.error('[waitlist] Rate limit check failed:', err)
    return { allowed: true }
  }
}
