import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('Seeding database...')

  // ── Regions ────────────────────────────────────────────────────────────

  const regionRows = await db
    .insert(schema.regions)
    .values([
      { code: 'us-pnw', name: 'US Pacific Northwest', timezone: 'America/Los_Angeles' },
      { code: 'us-west', name: 'US West', timezone: 'America/Los_Angeles' },
      { code: 'us-east', name: 'US East', timezone: 'America/New_York' },
      { code: 'us-south', name: 'US South', timezone: 'America/Chicago' },
      { code: 'us-midwest', name: 'US Midwest', timezone: 'America/Chicago' },
      { code: 'canada', name: 'Canada', timezone: 'America/Vancouver' },
      { code: 'eu', name: 'Europe', timezone: 'Europe/Berlin' },
      { code: 'latam', name: 'Latin America', timezone: 'America/Mexico_City' },
      { code: 'asia-pacific', name: 'Asia Pacific', timezone: 'Asia/Tokyo' },
    ])
    .returning()

  const region = Object.fromEntries(regionRows.map((r) => [r.code, r]))

  // ── Format tags ────────────────────────────────────────────────────────

  const formatRows = await db
    .insert(schema.formatTags)
    .values([
      { code: 'edh', name: 'Commander / EDH', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'cedh', name: 'Competitive EDH', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'modern', name: 'Modern', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'pioneer', name: 'Pioneer', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'standard', name: 'Standard', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'legacy', name: 'Legacy', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'vintage', name: 'Vintage', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'pauper', name: 'Pauper', colors: ['u', 'b'] },
      { code: 'limited', name: 'Draft / Sealed', colors: ['w', 'u', 'b', 'r', 'g'] },
      { code: 'other', name: 'Other', colors: [] },
    ])
    .returning()

  const fmt = Object.fromEntries(formatRows.map((f) => [f.code, f]))

  // ── Content tags ───────────────────────────────────────────────────────

  const tagRows = await db
    .insert(schema.contentTags)
    .values([
      { code: 'budget', kind: 'style', label: 'Budget' },
      { code: 'brewing', kind: 'style', label: 'Brewing' },
      { code: 'competitive', kind: 'style', label: 'Competitive' },
      { code: 'analytical', kind: 'style', label: 'Analytical' },
      { code: 'comedy', kind: 'style', label: 'Comedy' },
      { code: 'casual', kind: 'audience', label: 'Casual' },
      { code: 'beginner', kind: 'audience', label: 'Beginner-friendly' },
      { code: 'spike', kind: 'audience', label: 'Spike' },
      { code: 'timmy', kind: 'audience', label: 'Timmy' },
      { code: 'vorthos', kind: 'audience', label: 'Vorthos' },
      { code: 'tournament', kind: 'theme', label: 'Tournament' },
      { code: 'reanimator', kind: 'theme', label: 'Reanimator' },
    ])
    .returning()

  const tag = Object.fromEntries(tagRows.map((t) => [t.code, t]))

  // ── Creator users ──────────────────────────────────────────────────────
  // Seeded profiles don't have real Clerk accounts yet; userId is null.

  // ── Creator profiles ───────────────────────────────────────────────────

  type CreatorSeed = {
    slug: string
    displayName: string
    handle?: string
    bio: string
    regionCode: string
    primaryFormatCode: string
    primaryContentTagCode: string
    followersTotal: number
    verified?: boolean
    formats: string[]
    tags: string[]
    socials: Array<{
      platform: (typeof schema.platformEnum.enumValues)[number]
      handle: string
      url: string
      followers: number
    }>
    content?: Array<{
      platform: (typeof schema.platformEnum.enumValues)[number]
      externalId: string
      title: string
      publishedAt: Date
    }>
  }

  const creators: CreatorSeed[] = [
    {
      slug: 'lyra-vance',
      displayName: 'Lyra Vance',
      handle: 'lyrabrews',
      bio: 'Pauper brewer, occasional Modern dabbler. Building decks that are good and cheap. Tuesdays + Fridays on YouTube, Thursday nights on Twitch.',
      regionCode: 'us-pnw',
      primaryFormatCode: 'pauper',
      primaryContentTagCode: 'budget',
      followersTotal: 55100,
      verified: true,
      formats: ['pauper', 'modern'],
      tags: ['budget', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'lyrabrews', url: 'https://youtube.com/@lyrabrews', followers: 38200 },
        { platform: 'twitch', handle: 'lyrabrews', url: 'https://twitch.tv/lyrabrews', followers: 4200 },
        { platform: 'bluesky', handle: 'lyrabrews.bsky.social', url: 'https://bsky.app/profile/lyrabrews.bsky.social', followers: 12700 },
      ],
      content: [
        { platform: 'youtube', externalId: 'yt-lyra-01', title: 'Brewing $30 Dimir Faeries for the new meta', publishedAt: new Date('2026-05-16') },
        { platform: 'twitch', externalId: 'tw-lyra-01', title: 'VOD: Pauper challenge — 5 events, 1 deck', publishedAt: new Date('2026-05-13') },
        { platform: 'youtube', externalId: 'yt-lyra-02', title: 'Why Counterspell is still the line', publishedAt: new Date('2026-05-11') },
      ],
    },
    {
      slug: 'hauke-ostmann',
      displayName: 'Hauke Ostmann',
      handle: 'hauke',
      bio: 'Competitive EDH pilot and content creator based in Hamburg. Tournament coverage, deck techs, and the occasional cEDH primer.',
      regionCode: 'eu',
      primaryFormatCode: 'cedh',
      primaryContentTagCode: 'competitive',
      followersTotal: 28100,
      verified: true,
      formats: ['cedh', 'edh'],
      tags: ['competitive', 'tournament', 'analytical'],
      socials: [
        { platform: 'youtube', handle: 'haukeostmann', url: 'https://youtube.com/@haukeostmann', followers: 22000 },
        { platform: 'twitch', handle: 'haukeostmann', url: 'https://twitch.tv/haukeostmann', followers: 6100 },
      ],
      content: [
        { platform: 'youtube', externalId: 'yt-hauke-01', title: 'cEDH Primer: Thrasios-Tymna 2026 Update', publishedAt: new Date('2026-05-10') },
        { platform: 'youtube', externalId: 'yt-hauke-02', title: 'MagicCon Vegas Tournament Coverage Recap', publishedAt: new Date('2026-05-01') },
      ],
    },
    {
      slug: 'nadia-ruiz',
      displayName: 'Nadia Ruiz',
      handle: 'nadiabrews',
      bio: 'EDH content creator and comedian from CDMX. Making Commander accessible — and hilarious — for everyone.',
      regionCode: 'latam',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'comedy',
      followersTotal: 211000,
      verified: true,
      formats: ['edh'],
      tags: ['comedy', 'casual', 'beginner'],
      socials: [
        { platform: 'youtube', handle: 'nadiabrews', url: 'https://youtube.com/@nadiabrews', followers: 91000 },
        { platform: 'tiktok', handle: 'nadiabrews', url: 'https://tiktok.com/@nadiabrews', followers: 120000 },
      ],
      content: [
        { platform: 'youtube', externalId: 'yt-nadia-01', title: '5 Commander decks for total beginners', publishedAt: new Date('2026-05-14') },
        { platform: 'tiktok', externalId: 'tt-nadia-01', title: 'When your commander gets countered again', publishedAt: new Date('2026-05-17') },
      ],
    },
    {
      slug: 'eli-bramer',
      displayName: 'Eli Bramer',
      handle: 'selesnyaboy',
      bio: 'Seattle-based EDH brewer. Casual, budget-conscious, and always jamming green-white. 2× per week on YouTube and Bluesky.',
      regionCode: 'us-pnw',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'casual',
      followersTotal: 12100,
      formats: ['edh'],
      tags: ['casual', 'budget', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'selesnyaboy', url: 'https://youtube.com/@selesnyaboy', followers: 12100 },
        { platform: 'bluesky', handle: 'selesnyaboy.bsky.social', url: 'https://bsky.app/profile/selesnyaboy.bsky.social', followers: 3400 },
      ],
    },
    {
      slug: 'mara-okwu',
      displayName: 'Mara Okwu',
      handle: 'stomp',
      bio: 'Budget EDH specialist streaming from Vancouver, BC. If a deck costs more than $50 I probably hate it.',
      regionCode: 'canada',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'budget',
      followersTotal: 9400,
      formats: ['edh'],
      tags: ['budget', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'stompmtg', url: 'https://youtube.com/@stompmtg', followers: 9400 },
        { platform: 'tiktok', handle: 'stompmtg', url: 'https://tiktok.com/@stompmtg', followers: 5200 },
      ],
    },
    {
      slug: 'theo-park',
      displayName: 'Theo Park',
      handle: 'izzetbrew',
      bio: 'Portland-based Izzet enthusiast. Daily Twitch streams. Brewing jank so you don\'t have to.',
      regionCode: 'us-pnw',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'brewing',
      followersTotal: 2800,
      formats: ['edh', 'modern'],
      tags: ['brewing', 'casual'],
      socials: [
        { platform: 'twitch', handle: 'izzetbrew', url: 'https://twitch.tv/izzetbrew', followers: 2800 },
        { platform: 'bluesky', handle: 'izzetbrew.bsky.social', url: 'https://bsky.app/profile/izzetbrew.bsky.social', followers: 1100 },
      ],
    },
    {
      slug: 'hannah-doyle',
      displayName: 'Hannah Doyle',
      handle: 'hannahplays',
      bio: 'Tacoma-based casual EDH player and biweekly content creator. Podcast host for Tap & Chat.',
      regionCode: 'us-pnw',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'casual',
      followersTotal: 6100,
      formats: ['edh'],
      tags: ['casual', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'hannahplaysmtg', url: 'https://youtube.com/@hannahplaysmtg', followers: 6100 },
        { platform: 'podcast', handle: 'tapandchat', url: 'https://podcasts.apple.com/tapandchat', followers: 2800 },
      ],
    },
    {
      slug: 'sage-demir',
      displayName: 'Sage Demir',
      handle: 'rakdosqueen',
      bio: 'Istanbul-based Rakdos Reanimator specialist. Modern and cEDH. No mercy, lots of style.',
      regionCode: 'eu',
      primaryFormatCode: 'modern',
      primaryContentTagCode: 'competitive',
      followersTotal: 18400,
      formats: ['modern', 'cedh'],
      tags: ['competitive', 'reanimator'],
      socials: [
        { platform: 'youtube', handle: 'rakdosqueen', url: 'https://youtube.com/@rakdosqueen', followers: 18400 },
        { platform: 'twitter', handle: 'rakdosqueen', url: 'https://twitter.com/rakdosqueen', followers: 9200 },
      ],
    },
    {
      slug: 'priya-sundaram',
      displayName: 'Priya Sundaram',
      handle: 'prisundecks',
      bio: 'Pioneer content creator from Toronto. Brewing competitive and semi-competitive lists. Weekly videos, occasional tournament prep streams.',
      regionCode: 'canada',
      primaryFormatCode: 'pioneer',
      primaryContentTagCode: 'brewing',
      followersTotal: 14700,
      formats: ['pioneer', 'modern'],
      tags: ['brewing', 'competitive', 'analytical'],
      socials: [
        { platform: 'youtube', handle: 'prisundecks', url: 'https://youtube.com/@prisundecks', followers: 14700 },
        { platform: 'twitch', handle: 'prisundecks', url: 'https://twitch.tv/prisundecks', followers: 3100 },
      ],
    },
    {
      slug: 'marcus-webb',
      displayName: 'Marcus Webb',
      handle: 'izzetspark',
      bio: 'Atlanta-based Modern and Legacy grinder. Deep dives on metagame positioning and deck selection.',
      regionCode: 'us-east',
      primaryFormatCode: 'modern',
      primaryContentTagCode: 'analytical',
      followersTotal: 21300,
      formats: ['modern', 'legacy'],
      tags: ['analytical', 'competitive', 'tournament'],
      socials: [
        { platform: 'youtube', handle: 'izzetspark', url: 'https://youtube.com/@izzetspark', followers: 21300 },
        { platform: 'bluesky', handle: 'izzetspark.bsky.social', url: 'https://bsky.app/profile/izzetspark.bsky.social', followers: 5600 },
      ],
    },
    {
      slug: 'yuki-tanaka',
      displayName: 'Yuki Tanaka',
      handle: 'yukilands',
      bio: 'Tokyo-based Vintage and Legacy player. Japanese and English content. Serious about Power 9.',
      regionCode: 'asia-pacific',
      primaryFormatCode: 'vintage',
      primaryContentTagCode: 'competitive',
      followersTotal: 9800,
      formats: ['vintage', 'legacy'],
      tags: ['competitive', 'spike'],
      socials: [
        { platform: 'youtube', handle: 'yukilandsmtg', url: 'https://youtube.com/@yukilandsmtg', followers: 9800 },
        { platform: 'twitter', handle: 'yukilandsmtg', url: 'https://twitter.com/yukilandsmtg', followers: 4300 },
      ],
    },
    {
      slug: 'fatima-hassan',
      displayName: 'Fatima Hassan',
      handle: 'fatimacasts',
      bio: 'Berlin-based Commander creator focused on beginner-friendly budget builds. Making MTG less scary for new players.',
      regionCode: 'eu',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'beginner',
      followersTotal: 32100,
      formats: ['edh'],
      tags: ['beginner', 'budget', 'casual'],
      socials: [
        { platform: 'youtube', handle: 'fatimacasts', url: 'https://youtube.com/@fatimacasts', followers: 32100 },
        { platform: 'tiktok', handle: 'fatimacasts', url: 'https://tiktok.com/@fatimacasts', followers: 18700 },
      ],
    },
    {
      slug: 'carlos-vega',
      displayName: 'Carlos Vega',
      handle: 'izzgoblin',
      bio: 'Madrid-based Pioneer and Standard creator. Budget lists for the competitive grinder who doesn\'t want to break the bank.',
      regionCode: 'eu',
      primaryFormatCode: 'pioneer',
      primaryContentTagCode: 'budget',
      followersTotal: 8200,
      formats: ['pioneer', 'standard'],
      tags: ['budget', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'izzgoblin', url: 'https://youtube.com/@izzgoblin', followers: 8200 },
        { platform: 'twitch', handle: 'izzgoblin', url: 'https://twitch.tv/izzgoblin', followers: 2100 },
      ],
    },
    {
      slug: 'amara-johnson',
      displayName: 'Amara Johnson',
      handle: 'token-queen',
      bio: 'Chicago EDH content creator. Tokens, aristocrats, and good times. Never met a Doubling Season I didn\'t love.',
      regionCode: 'us-midwest',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'casual',
      followersTotal: 15600,
      formats: ['edh'],
      tags: ['casual', 'comedy', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'tokenqueenmtg', url: 'https://youtube.com/@tokenqueenmtg', followers: 15600 },
        { platform: 'tiktok', handle: 'tokenqueenmtg', url: 'https://tiktok.com/@tokenqueenmtg', followers: 22800 },
      ],
    },
    {
      slug: 'jin-ho',
      displayName: 'Jin Ho',
      handle: 'jinlegacy',
      bio: 'Seoul-based Legacy and Modern player. Metagame analysis and competitive deck primers.',
      regionCode: 'asia-pacific',
      primaryFormatCode: 'legacy',
      primaryContentTagCode: 'analytical',
      followersTotal: 11400,
      formats: ['legacy', 'modern'],
      tags: ['analytical', 'competitive', 'spike'],
      socials: [
        { platform: 'youtube', handle: 'jinlegacy', url: 'https://youtube.com/@jinlegacy', followers: 11400 },
        { platform: 'twitter', handle: 'jinlegacy', url: 'https://twitter.com/jinlegacy', followers: 6700 },
      ],
    },
    {
      slug: 'rosa-chen',
      displayName: 'Rosa Chen',
      handle: 'budget-pioneer',
      bio: 'San Francisco Pioneer brewer on a strict budget. Under $100 builds that actually win matches.',
      regionCode: 'us-west',
      primaryFormatCode: 'pioneer',
      primaryContentTagCode: 'budget',
      followersTotal: 7300,
      formats: ['pioneer'],
      tags: ['budget', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'budgetpioneermtg', url: 'https://youtube.com/@budgetpioneermtg', followers: 7300 },
        { platform: 'bluesky', handle: 'budgetpioneer.bsky.social', url: 'https://bsky.app/profile/budgetpioneer.bsky.social', followers: 2100 },
      ],
    },
    {
      slug: 'tobias-wright',
      displayName: 'Tobias Wright',
      handle: 'tobiaswrites',
      bio: 'London-based Vorthos content creator. Lore deep dives, world-building essays, and flavor-text appreciation posts. Commander when I\'m not writing.',
      regionCode: 'eu',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'vorthos',
      followersTotal: 19200,
      formats: ['edh'],
      tags: ['vorthos', 'casual'],
      socials: [
        { platform: 'youtube', handle: 'tobiaswrites', url: 'https://youtube.com/@tobiaswrites', followers: 19200 },
        { platform: 'bluesky', handle: 'tobiaswrites.bsky.social', url: 'https://bsky.app/profile/tobiaswrites.bsky.social', followers: 11300 },
      ],
    },
    {
      slug: 'dmitri-petrov',
      displayName: 'Dmitri Petrov',
      handle: 'cedh-dm',
      bio: 'Competitive EDH theorist and content creator. Stax, combo, and the relentless pursuit of the fastest wins.',
      regionCode: 'eu',
      primaryFormatCode: 'cedh',
      primaryContentTagCode: 'competitive',
      followersTotal: 24500,
      formats: ['cedh'],
      tags: ['competitive', 'spike', 'analytical'],
      socials: [
        { platform: 'youtube', handle: 'cedhDmitri', url: 'https://youtube.com/@cedhDmitri', followers: 24500 },
        { platform: 'twitch', handle: 'cedhDmitri', url: 'https://twitch.tv/cedhDmitri', followers: 8900 },
      ],
    },
    {
      slug: 'imani-clark',
      displayName: 'Imani Clark',
      handle: 'prerelease-queen',
      bio: 'Houston-based Limited and Standard player. Prerelease guides, draft walkthroughs, and set reviews for new players.',
      regionCode: 'us-south',
      primaryFormatCode: 'limited',
      primaryContentTagCode: 'beginner',
      followersTotal: 27800,
      formats: ['limited', 'standard'],
      tags: ['beginner', 'brewing'],
      socials: [
        { platform: 'youtube', handle: 'prereleasequeenmtg', url: 'https://youtube.com/@prereleasequeenmtg', followers: 27800 },
        { platform: 'tiktok', handle: 'prereleasequeenmtg', url: 'https://tiktok.com/@prereleasequeenmtg', followers: 34100 },
      ],
    },
    {
      slug: 'luca-ferrari',
      displayName: 'Luca Ferrari',
      handle: 'italian-edh',
      bio: 'Milan-based Commander enthusiast. Casual budget builds with Italian-language coverage. EDH per tutti.',
      regionCode: 'eu',
      primaryFormatCode: 'edh',
      primaryContentTagCode: 'budget',
      followersTotal: 6400,
      formats: ['edh'],
      tags: ['budget', 'casual'],
      socials: [
        { platform: 'youtube', handle: 'italianedh', url: 'https://youtube.com/@italianedh', followers: 6400 },
        { platform: 'tiktok', handle: 'italianedh', url: 'https://tiktok.com/@italianedh', followers: 4100 },
      ],
    },
  ]

  for (const c of creators) {
    const [profile] = await db
      .insert(schema.creatorProfiles)
      .values({
        slug: c.slug,
        displayName: c.displayName,
        handle: c.handle,
        bio: c.bio,
        regionId: region[c.regionCode].id,
        primaryFormatId: fmt[c.primaryFormatCode].id,
        primaryContentTagId: tag[c.primaryContentTagCode].id,
        followersTotal: c.followersTotal,
        verified: c.verified ?? false,
      })
      .returning()

    // formats (junction)
    if (c.formats.length > 0) {
      await db.insert(schema.creatorFormats).values(
        c.formats.map((code) => ({ creatorId: profile.id, formatId: fmt[code].id }))
      )
    }

    // content tags (junction)
    if (c.tags.length > 0) {
      await db.insert(schema.creatorContentTags).values(
        c.tags.map((code) => ({ creatorId: profile.id, tagId: tag[code].id }))
      )
    }

    // social accounts
    if (c.socials.length > 0) {
      await db.insert(schema.socialAccounts).values(
        c.socials.map((s) => ({
          creatorId: profile.id,
          platform: s.platform,
          handle: s.handle,
          url: s.url,
          followers: s.followers,
        }))
      )
    }

    // featured content
    if (c.content && c.content.length > 0) {
      await db.insert(schema.featuredContent).values(
        c.content.map((fc) => ({
          creatorId: profile.id,
          platform: fc.platform,
          externalId: fc.externalId,
          title: fc.title,
          publishedAt: fc.publishedAt,
        }))
      )
    }

    console.log(`  ✓ ${c.displayName}`)
  }

  // ── Events ─────────────────────────────────────────────────────────────

  const eventRows = await db
    .insert(schema.events)
    .values([
      {
        slug: 'magiccon-vegas-2026',
        name: 'MagicCon Vegas 2026',
        kind: 'convention',
        startDate: '2026-06-12',
        endDate: '2026-06-15',
        locationName: 'Las Vegas Convention Center, Las Vegas NV',
        lat: 36.1329,
        lng: -115.1518,
        regionId: region['us-west'].id,
      },
      {
        slug: 'mox-bellevue-rcq-jun26',
        name: 'Mox Boarding House RCQ',
        kind: 'rcq',
        startDate: '2026-06-21',
        locationName: 'Mox Boarding House, 10100 Main St, Bellevue WA',
        lat: 47.6101,
        lng: -122.2015,
        regionId: region['us-pnw'].id,
      },
      {
        slug: 'commandfest-atlanta-2026',
        name: 'CommandFest Atlanta 2026',
        kind: 'commandfest',
        startDate: '2026-07-06',
        endDate: '2026-07-08',
        locationName: 'Georgia World Congress Center, Atlanta GA',
        lat: 33.7598,
        lng: -84.3976,
        regionId: region['us-east'].id,
      },
      {
        slug: 'pauper-popup-pdx-jul26',
        name: 'Pauper Pop-up — Portland',
        kind: 'local',
        startDate: '2026-07-02',
        locationName: 'Ground Kontrol Classic Arcade, Portland OR',
        lat: 45.5247,
        lng: -122.6769,
        regionId: region['us-pnw'].id,
      },
    ])
    .returning()

  const event = Object.fromEntries(eventRows.map((e) => [e.slug, e]))
  console.log(`  ✓ ${eventRows.length} events`)

  // ── Appearances ────────────────────────────────────────────────────────

  // Look up creator IDs by slug from the DB
  const allCreators = await db.query.creatorProfiles.findMany({
    columns: { id: true, slug: true },
  })
  const creatorBySlug = Object.fromEntries(allCreators.map((c) => [c.slug, c]))

  await db.insert(schema.appearances).values([
    // MagicCon Vegas
    { creatorId: creatorBySlug['lyra-vance'].id, eventId: event['magiccon-vegas-2026'].id, role: 'panelist' },
    { creatorId: creatorBySlug['hauke-ostmann'].id, eventId: event['magiccon-vegas-2026'].id, role: 'booth' },
    { creatorId: creatorBySlug['nadia-ruiz'].id, eventId: event['magiccon-vegas-2026'].id, role: 'signing' },
    { creatorId: creatorBySlug['eli-bramer'].id, eventId: event['magiccon-vegas-2026'].id, role: 'coverage' },
    { creatorId: creatorBySlug['theo-park'].id, eventId: event['magiccon-vegas-2026'].id, role: 'attendee' },
    { creatorId: creatorBySlug['sage-demir'].id, eventId: event['magiccon-vegas-2026'].id, role: 'attendee' },
    { creatorId: creatorBySlug['mara-okwu'].id, eventId: event['magiccon-vegas-2026'].id, role: 'attendee' },
    { creatorId: creatorBySlug['marcus-webb'].id, eventId: event['magiccon-vegas-2026'].id, role: 'competitor' },
    { creatorId: creatorBySlug['dmitri-petrov'].id, eventId: event['magiccon-vegas-2026'].id, role: 'featured_guest' },
    { creatorId: creatorBySlug['fatima-hassan'].id, eventId: event['magiccon-vegas-2026'].id, role: 'panelist' },
    // Mox RCQ
    { creatorId: creatorBySlug['eli-bramer'].id, eventId: event['mox-bellevue-rcq-jun26'].id, role: 'featured_guest' },
    { creatorId: creatorBySlug['lyra-vance'].id, eventId: event['mox-bellevue-rcq-jun26'].id, role: 'attendee' },
    // CommandFest Atlanta
    { creatorId: creatorBySlug['amara-johnson'].id, eventId: event['commandfest-atlanta-2026'].id, role: 'featured_guest' },
    { creatorId: creatorBySlug['nadia-ruiz'].id, eventId: event['commandfest-atlanta-2026'].id, role: 'panelist' },
    { creatorId: creatorBySlug['imani-clark'].id, eventId: event['commandfest-atlanta-2026'].id, role: 'coverage' },
    { creatorId: creatorBySlug['marcus-webb'].id, eventId: event['commandfest-atlanta-2026'].id, role: 'attendee' },
    // Pauper Pop-up PDX
    { creatorId: creatorBySlug['lyra-vance'].id, eventId: event['pauper-popup-pdx-jul26'].id, role: 'featured_guest' },
    { creatorId: creatorBySlug['theo-park'].id, eventId: event['pauper-popup-pdx-jul26'].id, role: 'attendee' },
    { creatorId: creatorBySlug['eli-bramer'].id, eventId: event['pauper-popup-pdx-jul26'].id, role: 'attendee' },
  ])
  console.log('  ✓ appearances')

  // ── Stores ─────────────────────────────────────────────────────────────

  await db.insert(schema.stores).values([
    {
      slug: 'mox-bellevue',
      name: 'Mox Boarding House — Bellevue',
      address: '10100 Main St, Bellevue, WA 98004',
      website: 'https://www.moxboardinghouse.com',
      regionId: region['us-pnw'].id,
      verified: true,
    },
    {
      slug: 'mox-vegas',
      name: 'Mox Vegas',
      address: '3900 Paradise Rd, Las Vegas, NV 89169',
      website: 'https://www.moxboardinghouse.com/las-vegas',
      regionId: region['us-west'].id,
      verified: true,
    },
    {
      slug: 'card-kingdom-seattle',
      name: 'Card Kingdom — Seattle',
      address: '6739 Greenwood Ave N, Seattle, WA 98103',
      website: 'https://www.cardkingdom.com',
      regionId: region['us-pnw'].id,
      verified: true,
    },
  ])
  console.log('  ✓ stores')

  console.log('\nSeed complete.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
