'use client'

import posthog from 'posthog-js'

// Thin wrapper — initialization is handled by app/providers.tsx (PostHogProvider).
// Only call client-side; no-op if PostHog is not initialized yet.
export function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, properties)
}
