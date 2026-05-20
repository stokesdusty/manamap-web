import { z } from 'zod'

// Each field is a required string that accepts '' or a valid handle pattern.
// The form always supplies '' as default for empty platforms.
const h = (pattern: string, msg: string) =>
  z.string().max(200).regex(new RegExp(`^(|${pattern})$`), msg)

export const platformsSchema = z.object({
  youtube:   h('[a-zA-Z0-9_.-]{1,100}',  'Invalid YouTube handle'),
  twitch:    h('[a-zA-Z0-9_]{4,25}',     'Twitch: 4–25 alphanumeric or underscore'),
  tiktok:    h('[a-zA-Z0-9_.]{1,24}',    'Invalid TikTok handle'),
  bluesky:   h('[a-zA-Z0-9.-]{1,100}',   'Invalid Bluesky handle'),
  twitter:   h('[a-zA-Z0-9_]{1,15}',     'X: up to 15 alphanumeric or underscore'),
  instagram: h('[a-zA-Z0-9_.]{1,30}',    'Instagram: up to 30 characters'),
  patreon:   h('[a-zA-Z0-9_-]{1,100}',   'Invalid Patreon handle'),
  moxfield:  h('[a-zA-Z0-9_-]{1,100}',   'Invalid Moxfield handle'),
  archidekt: h('[a-zA-Z0-9_-]{1,100}',   'Invalid Archidekt handle'),
  podcast:   h('[^\\s]{1,200}',           'Invalid podcast URL'),
})

export type PlatformsFormValues = z.infer<typeof platformsSchema>

export const PLATFORM_URL: Record<string, (h: string) => string> = {
  youtube:   (h) => `https://youtube.com/@${h}`,
  twitch:    (h) => `https://twitch.tv/${h}`,
  tiktok:    (h) => `https://tiktok.com/@${h}`,
  bluesky:   (h) => `https://bsky.app/profile/${h}`,
  twitter:   (h) => `https://x.com/${h}`,
  instagram: (h) => `https://instagram.com/${h}`,
  patreon:   (h) => `https://patreon.com/${h}`,
  moxfield:  (h) => `https://moxfield.com/users/${h}`,
  archidekt: (h) => `https://archidekt.com/u/${h}`,
  podcast:   (h) => h,
}

export const PLATFORM_LABELS: Record<string, string> = {
  youtube:   'YouTube',
  twitch:    'Twitch',
  tiktok:    'TikTok',
  bluesky:   'Bluesky',
  twitter:   'X (Twitter)',
  instagram: 'Instagram',
  patreon:   'Patreon',
  moxfield:  'Moxfield',
  archidekt: 'Archidekt',
  podcast:   'Podcast',
}
