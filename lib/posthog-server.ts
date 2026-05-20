// Server-side PostHog query helper — requires POSTHOG_PERSONAL_API_KEY + POSTHOG_PROJECT_ID

export async function getProfileViewCount(slug: string): Promise<number | null> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

  if (!apiKey || !projectId) return null

  try {
    const query = `
      SELECT count()
      FROM events
      WHERE event = 'profile_view'
        AND JSONExtractString(properties, 'slug') = '${slug.replace(/'/g, "\\'")}'
        AND timestamp >= now() - INTERVAL 30 DAY
    `
    const res = await fetch(`${host}/api/projects/${projectId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null

    const json = (await res.json()) as { results?: Array<[number]> }
    return json.results?.[0]?.[0] ?? null
  } catch {
    return null
  }
}
