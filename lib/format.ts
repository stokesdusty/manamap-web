export const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  tiktok: 'TikTok',
  bluesky: 'Bluesky',
  twitter: 'Twitter',
  instagram: 'Instagram',
  moxfield: 'Moxfield',
  archidekt: 'Archidekt',
  podcast: 'Podcast',
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

/** Expects 'YYYY-MM-DD' string from Drizzle date columns. */
export function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-')
  const month = parseInt(parts[1]!, 10)
  const day = parseInt(parts[2]!, 10)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${MONTHS[month - 1]} ${day}`
}

/** Human-readable relative date from an ISO timestamp string. */
export function formatRelativeDate(isoStr: string): string {
  const diffMs = Date.now() - new Date(isoStr).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 wk ago'
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} wks ago`
  return formatShortDate(new Date(isoStr).toISOString().slice(0, 10))
}
