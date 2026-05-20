import {
  pgTable,
  pgEnum,
  bigserial,
  bigint,
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

// ── Custom Postgres type ──────────────────────────────────────────────────
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
  'podcast',
  'patreon',
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
  'coverage',
  'signing',
  'booth',
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
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default('fan'),
  clerkId: varchar('clerk_id', { length: 255 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const regions = pgTable('regions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  timezone: varchar('timezone', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const formatTags = pgTable('format_tags', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: formatCodeEnum('code').notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  // Informational WUBRG color associations for UI pip display
  colors: jsonb('colors')
    .$type<Array<'w' | 'u' | 'b' | 'r' | 'g'>>()
    .notNull()
    .default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const contentTags = pgTable('content_tags', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  kind: contentTagKindEnum('kind').notNull(),
  label: varchar('label', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const creatorProfiles = pgTable(
  'creator_profiles',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    handle: varchar('handle', { length: 128 }),
    bio: text('bio'),
    avatarUrl: varchar('avatar_url', { length: 2048 }),
    bannerUrl: varchar('banner_url', { length: 2048 }),
    websiteUrl: varchar('website_url', { length: 2048 }),
    regionId: bigint('region_id', { mode: 'number' }).references(() => regions.id),
    // Denormalized for the composite faceted-search index below. Junction tables hold the full many-to-many.
    primaryFormatId: bigint('primary_format_id', { mode: 'number' }).references(
      () => formatTags.id
    ),
    primaryContentTagId: bigint('primary_content_tag_id', { mode: 'number' }).references(
      () => contentTags.id
    ),
    verified: boolean('verified').notNull().default(false),
    published: boolean('published').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    colors: jsonb('colors')
      .$type<Array<'w' | 'u' | 'b' | 'r' | 'g'>>()
      .notNull()
      .default([]),
    followersTotal: integer('followers_total').notNull().default(0),
    // Maintained by Postgres trigger:
    //   setweight(to_tsvector('english', display_name), 'A') ||
    //   setweight(to_tsvector('english', coalesce(bio, '')), 'B')
    searchVector: tsvector('search_vector'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Full-text search via GIN on the weighted tsvector
    index('creator_profiles_search_vector_idx').using('gin', t.searchVector),
    // Typo-tolerant prefix search on display_name via pg_trgm
    // Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;
    index('creator_profiles_display_name_trgm_idx').using(
      'gin',
      t.displayName.op('gin_trgm_ops')
    ),
    // Composite for faceted search: format + content-style + region
    index('creator_profiles_facet_idx').on(
      t.primaryFormatId,
      t.primaryContentTagId,
      t.regionId
    ),
    // Sort key for directory listings
    index('creator_profiles_followers_idx').on(t.followersTotal),
    index('creator_profiles_slug_idx').on(t.slug),
    index('creator_profiles_region_idx').on(t.regionId),
  ]
)

export const socialAccounts = pgTable('social_accounts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  creatorId: bigint('creator_id', { mode: 'number' })
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  handle: varchar('handle', { length: 255 }).notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  followers: integer('followers').notNull().default(0),
  syncedAt: timestamp('synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Junction: creator ↔ format (many-to-many)
export const creatorFormats = pgTable(
  'creator_formats',
  {
    creatorId: bigint('creator_id', { mode: 'number' })
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    formatId: bigint('format_id', { mode: 'number' })
      .notNull()
      .references(() => formatTags.id),
  },
  (t) => [primaryKey({ columns: [t.creatorId, t.formatId] })]
)

// Junction: creator ↔ content tag (many-to-many)
export const creatorContentTags = pgTable(
  'creator_content_tags',
  {
    creatorId: bigint('creator_id', { mode: 'number' })
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    tagId: bigint('tag_id', { mode: 'number' })
      .notNull()
      .references(() => contentTags.id),
  },
  (t) => [primaryKey({ columns: [t.creatorId, t.tagId] })]
)

export const featuredContent = pgTable('featured_content', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  creatorId: bigint('creator_id', { mode: 'number' })
    .notNull()
    .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  externalId: varchar('external_id', { length: 255 }).notNull().default(''),
  title: text('title').notNull(),
  url: varchar('url', { length: 2048 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 2048 }),
  sortOrder: integer('sort_order').notNull().default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const events = pgTable(
  'events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    kind: eventKindEnum('kind').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    locationName: varchar('location_name', { length: 255 }),
    lat: real('lat'),
    lng: real('lng'),
    regionId: bigint('region_id', { mode: 'number' }).references(() => regions.id),
    storeId: bigint('store_id', { mode: 'number' }).references(() => stores.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('events_start_date_idx').on(t.startDate),
    index('events_region_idx').on(t.regionId),
    index('events_kind_idx').on(t.kind),
    index('events_store_idx').on(t.storeId),
  ]
)

export const eventScheduleItems = pgTable(
  'event_schedule_items',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    eventId: bigint('event_id', { mode: 'number' })
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    dayLabel: varchar('day_label', { length: 16 }).notNull(),
    startTime: varchar('start_time', { length: 8 }).notNull(),
    title: text('title').notNull(),
    locationLabel: varchar('location_label', { length: 128 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('event_schedule_items_event_idx').on(t.eventId)]
)

export const storeCreators = pgTable(
  'store_creators',
  {
    storeId: bigint('store_id', { mode: 'number' })
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    creatorId: bigint('creator_id', { mode: 'number' })
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 64 }).notNull().default('featured'),
    note: varchar('note', { length: 128 }),
  },
  (t) => [primaryKey({ columns: [t.storeId, t.creatorId] })]
)

export const appearances = pgTable(
  'appearances',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    creatorId: bigint('creator_id', { mode: 'number' })
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    eventId: bigint('event_id', { mode: 'number' })
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    role: appearanceRoleEnum('role').notNull().default('attendee'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('appearances_creator_idx').on(t.creatorId),
    index('appearances_event_idx').on(t.eventId),
  ]
)

export const stores = pgTable('stores', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  website: varchar('website', { length: 2048 }),
  regionId: bigint('region_id', { mode: 'number' }).references(() => regions.id),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Phase 4+ — scaffolded, not wired to any UI yet
export const bookings = pgTable('bookings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  creatorId: bigint('creator_id', { mode: 'number' })
    .notNull()
    .references(() => creatorProfiles.id),
  storeId: bigint('store_id', { mode: 'number' }).references(() => stores.id),
  eventId: bigint('event_id', { mode: 'number' }).references(() => events.id),
  status: bookingStatusEnum('status').notNull().default('pending'),
  feeCents: integer('fee_cents').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Phase 4+ — scaffolded, not wired to any UI yet
export const subscriptions = pgTable('subscriptions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum('plan').notNull().default('free'),
  cycle: subscriptionCycleEnum('cycle'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
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

export const formatTagsRelations = relations(formatTags, ({ many }) => ({
  creators: many(creatorFormats),
}))

export const contentTagsRelations = relations(contentTags, ({ many }) => ({
  creators: many(creatorContentTags),
}))

export const creatorProfilesRelations = relations(creatorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
  region: one(regions, {
    fields: [creatorProfiles.regionId],
    references: [regions.id],
  }),
  primaryFormat: one(formatTags, {
    fields: [creatorProfiles.primaryFormatId],
    references: [formatTags.id],
  }),
  primaryContentTag: one(contentTags, {
    fields: [creatorProfiles.primaryContentTagId],
    references: [contentTags.id],
  }),
  socialAccounts: many(socialAccounts),
  formats: many(creatorFormats),
  contentTags: many(creatorContentTags),
  featuredContent: many(featuredContent),
  appearances: many(appearances),
  bookings: many(bookings),
}))

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [socialAccounts.creatorId],
    references: [creatorProfiles.id],
  }),
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

export const creatorContentTagsRelations = relations(creatorContentTags, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [creatorContentTags.creatorId],
    references: [creatorProfiles.id],
  }),
  tag: one(contentTags, {
    fields: [creatorContentTags.tagId],
    references: [contentTags.id],
  }),
}))

export const featuredContentRelations = relations(featuredContent, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [featuredContent.creatorId],
    references: [creatorProfiles.id],
  }),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  region: one(regions, {
    fields: [events.regionId],
    references: [regions.id],
  }),
  store: one(stores, {
    fields: [events.storeId],
    references: [stores.id],
  }),
  appearances: many(appearances),
  scheduleItems: many(eventScheduleItems),
  bookings: many(bookings),
}))

export const eventScheduleItemsRelations = relations(eventScheduleItems, ({ one }) => ({
  event: one(events, {
    fields: [eventScheduleItems.eventId],
    references: [events.id],
  }),
}))

export const storeCreatorsRelations = relations(storeCreators, ({ one }) => ({
  store: one(stores, {
    fields: [storeCreators.storeId],
    references: [stores.id],
  }),
  creator: one(creatorProfiles, {
    fields: [storeCreators.creatorId],
    references: [creatorProfiles.id],
  }),
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
  events: many(events),
  storeCreators: many(storeCreators),
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
