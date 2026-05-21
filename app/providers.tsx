'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (key) {
    posthog.init(key, {
      api_host: '/ph',
      ui_host: 'https://us.i.posthog.com',
      capture_pageview: false, // fired manually below
      capture_pageleave: true,
      disable_dead_clicks: true,
    })
  }
}

function PageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [pathname, searchParams])
  return null
}

function ClerkSync() {
  const { user, isSignedIn } = useUser()
  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      })
    } else if (isSignedIn === false) {
      posthog.reset()
    }
  }, [isSignedIn, user])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageView />
      </Suspense>
      <ClerkSync />
      {children}
    </PHProvider>
  )
}
