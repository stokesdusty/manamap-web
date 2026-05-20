'use client'

import { useEffect } from 'react'
import { capture } from '@/lib/posthog'

export function ProfileViewCapture({ slug }: { slug: string }) {
  useEffect(() => {
    capture('profile_view', { slug })
  }, [slug])

  return null
}
