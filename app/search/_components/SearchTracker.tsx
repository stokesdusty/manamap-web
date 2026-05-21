'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'

export function SearchTracker() {
  const posthog = usePostHog()
  const searchParams = useSearchParams()
  const prevParams = useRef<string>('')

  useEffect(() => {
    const current = searchParams.toString()
    if (current === prevParams.current) return
    const prev = prevParams.current
    prevParams.current = current

    const q = searchParams.get('q') ?? ''
    const formats = searchParams.get('formats') ?? ''
    const tags = searchParams.get('tags') ?? ''
    const colors = searchParams.get('colors') ?? ''
    const region = searchParams.get('region') ?? ''
    const audience = searchParams.get('audience') ?? ''

    // Detect whether a filter facet changed vs the text query
    const prevQ = new URLSearchParams(prev).get('q') ?? ''
    if (q !== prevQ) {
      posthog.capture('search_executed', { query: q, filters: { formats, tags, colors, region, audience } })
    } else {
      posthog.capture('facet_toggled', { formats, tags, colors, region, audience })
    }
  }, [searchParams, posthog])

  return null
}
