'use client'

import posthog from 'posthog-js'

let initialised = false

function init() {
  if (initialised || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: false,
  })
  initialised = true
}

export function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  init()
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.capture(event, properties)
}
