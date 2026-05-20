import { z } from 'zod'

// Used by the client form — all fields are plain strings so RHF input/output types match.
// The server action does its own stricter parsing (regionId coercion etc.).

const optUrl = z.union([
  z.literal(''),
  z.string().max(2048).url('Enter a valid URL (https://…)'),
])

export const profileFormSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(255),
  handle: z
    .string()
    .min(2, 'At least 2 characters')
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  bio:        z.string().max(280, 'Max 280 characters'),
  websiteUrl: optUrl,
  avatarUrl:  optUrl,
  bannerUrl:  optUrl,
  regionId:   z.string(), // select value is always a string; action coerces to number
  formats:    z.array(z.string()).min(1, 'Pick at least one format'),
  colors:     z.array(z.string()),
  tags:       z.array(z.string()),
  audience:   z.array(z.string()),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
