import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  real,
  jsonb,
  timestamp,
  date,
  index,
  primaryKey,
  customType,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Custom Postgres types ─────────────────────────────────────────────────
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

// ── Enums ─────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', [
  'fan',
  'creator',
  'store_owner',
  'organizer',
  'admin',
])

export const platformEnum = pgEnum('platform', [
  'youtube',
  'twitch',
  'tiktok',
  'bluesky',
  'twitter',
  'instagram',
  'moxfield',
  'archidekt',
])

export const formatCodeEnum = pgEnum('format_code', [
  'edh',
  'cedh',
  'modern',
  'pioneer',
  'standard',
  'legacy',
  'vintage',
  'pauper',
  'limited',
  'other',
])

export const contentTagKindEnum = pgEnum('content_tag_kind', [
  'style',
  'audience',
  'theme',
])

export const eventKindEnum = pgEnum('event_kind', [
  'convention',
  'commandfest',
  'rcq',
  'grand_prix',
  'prerelease',
  'fnm',
  'local',
])

export const appearanceRoleEnum = pgEnum('appearance_role', [
  'featured_guest',
  'panelist',
  'judge',
  'competitor',
  'attendee',
])

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'declined',
  'cancelled',
])

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'pro',
  'store',
])

export const subscriptionCycleEnum = pgEnum('subscription_cycle', [
  'monthly',
  'annual',
])

// ── Tables ────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default('fan'),
  clerkId: varchar('clerk_id', { length: 255 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  timezone: varchar('timezone', { length: 64 }).notNull(),
})

export const creatorProfiles = pgTable(
  'creator_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    bio: text('bio'),
    regionId: uuid('region_id').references(() => regions.id),
    verified: boolean('verified').notNull().default(false),
    followersTotal: integer('followers_total').notNull().default(0),
    // Maintained by Postgres trigger: setweight(to_tsvector('english', display_name), 'A') || setweight(to_tsvector('english', coalesce(bio,'')), 'B')
    searchVector: tsvector('search_vector'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('creator_profiles_search_vector_idx').using('gin', t.searchVector),
    index('creator_profiles_slug_idx').on(t.slug),
    index('creator_profiles_followers_idx').on(t.followersTotal),
    index('creator_profiles_region_idx').on(t.regionId),
  ]
)

export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  handle: varchar('handle', { length: 255 }).notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  followers: integer('followers').notNull().default(0),
  syncedAt: timestamp('synced_at', { withTimezone: true }),
})

export const formatTags = pgTable('format_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: formatCodeEnum('code').notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  // Informational array of associated WUBRG color codes
  colors: jsonb('colors')
    .$type<Array<'w' | 'u' | 'b' | 'r' | 'g'>>()
    .notNull()
    .default([]),
})

export const contentTags = pgTable('content_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  kind: contentTagKindEnum('kind').notNull(),
  label: varchar('label', { length: 128 }).notNull(),
})

// Junction: creator ↔ format
export const creatorFormats = pgTable(
  'creator_formats',
  {
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    formatId: uuid('format_id')
      .notNull()
      .references(() => formatTags.id),
  },
  (t) => [primaryKey({ columns: [t.creatorId, t.formatId] })]
)

// Junction: creator ↔ content tag
export const creatorContentTags = pgTable(
  'creator_content_tags',
  {
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => contentTags.id),
  },
  (t) => [primaryKey({ columns: [t.creatorId, t.tagId] })]
)

export const featuredContent = pgTable('featured_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  externalId: varchar('external_id', { length: 255 }).notNull(),
  title: text('title').notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 2048 }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
})

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    kind: eventKindEnum('kind').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    locationName: varchar('location_name', { length: 255 }),
    lat: real('lat'),
    lng: real('lng'),
    regionId: uuid('region_id').references(() => regions.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('events_start_date_idx').on(t.startDate),
    index('events_region_idx').on(t.regionId),
    index('events_kind_idx').on(t.kind),
  ]
)

export const appearances = pgTable(
  'appearances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    role: appearanceRoleEnum('role').notNull().default('attendee'),
  },
  (t) => [
    index('appearances_creator_idx').on(t.creatorId),
    index('appearances_event_idx').on(t.eventId),
  ]
)

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  regionId: uuid('region_id').references(() => regions.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Phase 4+ — scaffolded, not wired to any UI yet
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => creatorProfiles.id),
  storeId: uuid('store_id').references(() => stores.id),
  eventId: uuid('event_id').references(() => events.id),
  status: bookingStatusEnum('status').notNull().default('pending'),
  feeCents: integer('fee_cents').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Phase 4+ — scaffolded, not wired to any UI yet
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum('plan').notNull().default('free'),
  cycle: subscriptionCycleEnum('cycle'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// ── Relations ─────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  creatorProfile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
  store: one(stores, {
    fields: [users.id],
    references: [stores.userId],
  }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}))

export const regionsRelations = relations(regions, ({ many }) => ({
  creators: many(creatorProfiles),
  events: many(events),
  stores: many(stores),
}))

export const creatorProfilesRelations = relations(
  creatorProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [creatorProfiles.userId],
      references: [users.id],
    }),
    region: one(regions, {
      fields: [creatorProfiles.regionId],
      references: [regions.id],
    }),
    socialAccounts: many(socialAccounts),
    formats: many(creatorFormats),
    contentTags: many(creatorContentTags),
    featuredContent: many(featuredContent),
    appearances: many(appearances),
    bookings: many(bookings),
  })
)

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [socialAccounts.creatorId],
    references: [creatorProfiles.id],
  }),
}))

export const formatTagsRelations = relations(formatTags, ({ many }) => ({
  creators: many(creatorFormats),
}))

export const contentTagsRelations = relations(contentTags, ({ many }) => ({
  creators: many(creatorContentTags),
}))

export const creatorFormatsRelations = relations(creatorFormats, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [creatorFormats.creatorId],
    references: [creatorProfiles.id],
  }),
  format: one(formatTags, {
    fields: [creatorFormats.formatId],
    references: [formatTags.id],
  }),
}))

export const creatorContentTagsRelations = relations(
  creatorContentTags,
  ({ one }) => ({
    creator: one(creatorProfiles, {
      fields: [creatorContentTags.creatorId],
      references: [creatorProfiles.id],
    }),
    tag: one(contentTags, {
      fields: [creatorContentTags.tagId],
      references: [contentTags.id],
    }),
  })
)

export const featuredContentRelations = relations(
  featuredContent,
  ({ one }) => ({
    creator: one(creatorProfiles, {
      fields: [featuredContent.creatorId],
      references: [creatorProfiles.id],
    }),
  })
)

export const eventsRelations = relations(events, ({ one, many }) => ({
  region: one(regions, {
    fields: [events.regionId],
    references: [regions.id],
  }),
  appearances: many(appearances),
  bookings: many(bookings),
}))

export const appearancesRelations = relations(appearances, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [appearances.creatorId],
    references: [creatorProfiles.id],
  }),
  event: one(events, {
    fields: [appearances.eventId],
    references: [events.id],
  }),
}))

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  region: one(regions, {
    fields: [stores.regionId],
    references: [regions.id],
  }),
  bookings: many(bookings),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [bookings.creatorId],
    references: [creatorProfiles.id],
  }),
  store: one(stores, {
    fields: [bookings.storeId],
    references: [stores.id],
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}))
