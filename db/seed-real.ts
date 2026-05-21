/**
 * Seeds 50 well-known MTG creators with published=false.
 * Run once after the base seed: npm run db:seed-real
 *
 * Social handles are only included where confirmed accurate.
 * Profiles without social accounts still seed a discoverable slug
 * that creators can claim and fill in themselves.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

type SocialEntry = {
  platform: (typeof schema.platformEnum.enumValues)[number]
  handle: string
  url: string
}

type RealCreator = {
  slug: string
  displayName: string
  handle?: string
  bio: string
  regionCode: string
  primaryFormatCode: string
  primaryContentTagCode: string
  formats: string[]
  tags: string[]
  socials: SocialEntry[]
}

function ytUrl(h: string) { return `https://youtube.com/@${h}` }
function twUrl(h: string) { return `https://twitch.tv/${h}` }
function ttUrl(h: string) { return `https://tiktok.com/@${h}` }

const creators: RealCreator[] = [
  // ── Big EDH Channels ────────────────────────────────────────────────────────
  {
    slug: 'the-command-zone',
    displayName: 'The Command Zone',
    handle: 'commandzone',
    bio: 'The most-watched Commander podcast and YouTube channel. Hosted by Jimmy Wong and Josh Lee Kwai. Weekly deck techs, gameplay, and Commander rules coverage.',
    regionCode: 'us-west',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'casual',
    formats: ['edh'],
    tags: ['casual', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'thecommandzone', url: ytUrl('thecommandzone') },
    ],
  },
  {
    slug: 'game-knights',
    displayName: 'Game Knights',
    handle: 'gameknights',
    bio: 'High-production Commander gameplay show from The Command Zone network. Celebrity guests, signature decks, and the best EDH gameplay on YouTube.',
    regionCode: 'us-west',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'casual',
    formats: ['edh'],
    tags: ['casual', 'comedy'],
    socials: [
      { platform: 'youtube', handle: 'GameKnights', url: ytUrl('GameKnights') },
    ],
  },
  {
    slug: 'tolarian-community-college',
    displayName: 'Tolarian Community College',
    handle: 'theprof',
    bio: 'Product reviews, budget brewing, and MTG news from "The Professor." The go-to channel for accessory reviews and beginner-friendly Commander content.',
    regionCode: 'us-east',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'beginner',
    formats: ['edh'],
    tags: ['beginner', 'budget'],
    socials: [
      { platform: 'youtube', handle: 'TolarianCommunityCollege', url: ytUrl('TolarianCommunityCollege') },
    ],
  },
  {
    slug: 'nitpicking-nerds',
    displayName: 'Nitpicking Nerds',
    handle: 'nitpickingnerds',
    bio: 'Card-by-card evaluation and Commander deck building. Charlie and Michael break down every new set for EDH impact with rigorous analytical takes.',
    regionCode: 'us-east',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'analytical',
    formats: ['edh'],
    tags: ['analytical', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'NitpickingNerds', url: ytUrl('NitpickingNerds') },
    ],
  },
  {
    slug: 'the-trinisphere',
    displayName: 'The Trinisphere',
    handle: 'trinisphere',
    bio: 'Commander variety show covering Spikes, Brewers, and Timmy players. Bobby, Luis, and Sean represent every playstyle at the EDH table.',
    regionCode: 'us-east',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'casual',
    formats: ['edh'],
    tags: ['casual', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'TheTrinisphere', url: ytUrl('TheTrinisphere') },
    ],
  },
  {
    slug: 'the-spike-feeders',
    displayName: 'The Spike Feeders',
    handle: 'spikefeeders',
    bio: 'EDH and cEDH gameplay, primers, and theory. Jim, Bill, and Jan cover the full competitive Commander spectrum with detailed in-game narration.',
    regionCode: 'us-east',
    primaryFormatCode: 'cedh',
    primaryContentTagCode: 'competitive',
    formats: ['cedh', 'edh'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'TheSpikeFeeders', url: ytUrl('TheSpikeFeeders') },
    ],
  },
  {
    slug: 'brew-for-your-buck',
    displayName: 'Brew for Your Buck',
    handle: 'brewforyourbuck',
    bio: 'Budget Commander brewing that punches well above its weight. Consistent upgrades to precons and original budget builds under $50.',
    regionCode: 'us-east',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'budget',
    formats: ['edh'],
    tags: ['budget', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'BrewForYourBuck', url: ytUrl('BrewForYourBuck') },
    ],
  },
  {
    slug: 'pleasant-kenobi',
    displayName: 'PleasantKenobi',
    handle: 'pleasantkenobi',
    bio: 'British Commander content creator known for irreverent humor and creative deck building. EDH variety from chaos to control, always entertaining.',
    regionCode: 'eu',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'comedy',
    formats: ['edh'],
    tags: ['comedy', 'casual'],
    socials: [
      { platform: 'youtube', handle: 'PleasantKenobi', url: ytUrl('PleasantKenobi') },
    ],
  },
  {
    slug: 'commander-sphere',
    displayName: 'Commander Sphere',
    handle: 'commandersphere',
    bio: 'Commander variety content covering deck building, gameplay, and the social side of EDH. Focused on all player archetypes at the kitchen table.',
    regionCode: 'us-midwest',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'casual',
    formats: ['edh'],
    tags: ['casual', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'CommanderSphere', url: ytUrl('CommanderSphere') },
    ],
  },
  {
    slug: 'ready-to-role',
    displayName: 'Ready to Role',
    handle: 'readytorole',
    bio: 'Commander content focused on roleplaying, narrative, and thematic deck building. Where EDH meets D&D aesthetic.',
    regionCode: 'us-west',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'vorthos',
    formats: ['edh'],
    tags: ['vorthos', 'casual'],
    socials: [
      { platform: 'youtube', handle: 'ReadytoRole', url: ytUrl('ReadytoRole') },
    ],
  },
  {
    slug: 'the-commanders-quarters',
    displayName: "The Commander's Quarters",
    handle: 'commandersquarters',
    bio: 'Budget Commander brewing with a focus on $25 and under decks. Mitch shows that you don\'t need to spend a lot to have fun at the EDH table.',
    regionCode: 'us-pnw',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'budget',
    formats: ['edh'],
    tags: ['budget', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'CommandersQuarters', url: ytUrl('CommandersQuarters') },
    ],
  },
  {
    slug: 'power-word-kill',
    displayName: 'Power Word Kill',
    handle: 'powerwordkill',
    bio: 'EDH variety content with a focus on gameplay, deck techs, and the fun social dynamics of Commander. Regular gameplay episodes and deck brews.',
    regionCode: 'us-south',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'casual',
    formats: ['edh'],
    tags: ['casual', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'PowerWordKill', url: ytUrl('PowerWordKill') },
    ],
  },
  {
    slug: 'scrap-trawlers',
    displayName: 'Scrap Trawlers',
    handle: 'scraptrawlers',
    bio: 'Budget Commander content specializing in artifact strategies and value-oriented builds. Regular deck techs and gameplay on a strict budget.',
    regionCode: 'us-midwest',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'budget',
    formats: ['edh'],
    tags: ['budget', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'ScrapTrawlers', url: ytUrl('ScrapTrawlers') },
    ],
  },

  // ── cEDH ────────────────────────────────────────────────────────────────────
  {
    slug: 'the-lab-maniacs',
    displayName: 'The Lab Maniacs',
    handle: 'labmaniacs',
    bio: 'The premier competitive EDH YouTube channel. Gameplay, primers, and theory from some of the best cEDH players in the world.',
    regionCode: 'eu',
    primaryFormatCode: 'cedh',
    primaryContentTagCode: 'competitive',
    formats: ['cedh'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'LabManiacsChannel', url: ytUrl('LabManiacsChannel') },
    ],
  },
  {
    slug: 'casually-competitive-mtg',
    displayName: 'Casually Competitive MTG',
    handle: 'casuallycompetitive',
    bio: 'cEDH content, gameplay, and discussion from Mitch. Focused on the intersection of casual Commander and highly optimized strategies.',
    regionCode: 'eu',
    primaryFormatCode: 'cedh',
    primaryContentTagCode: 'competitive',
    formats: ['cedh', 'edh'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'CasuallyCompetitiveMTG', url: ytUrl('CasuallyCompetitiveMTG') },
    ],
  },

  // ── Competitive / Limited ────────────────────────────────────────────────────
  {
    slug: 'numot-the-nummy',
    displayName: 'NumotTheNummy',
    handle: 'numotthenummy',
    bio: 'Kenji Egashira — Limited specialist and long-running Twitch streamer. Expert draft walkthroughs, sealed guides, and competitive event coverage.',
    regionCode: 'us-west',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'standard'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'NumotTheNummy', url: ytUrl('NumotTheNummy') },
      { platform: 'twitch', handle: 'numotthenummy', url: twUrl('numotthenummy') },
    ],
  },
  {
    slug: 'loading-ready-run',
    displayName: 'LoadingReadyRun',
    handle: 'loadingreadyrun',
    bio: 'Long-running Canadian gaming comedy crew. Regular Friday Night Paper Fight Commander gameplay and PrePreRelease set previews attract MTG fans worldwide.',
    regionCode: 'canada',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'comedy',
    formats: ['limited', 'edh'],
    tags: ['comedy', 'casual'],
    socials: [
      { platform: 'youtube', handle: 'LoadingReadyRun', url: ytUrl('LoadingReadyRun') },
      { platform: 'twitch', handle: 'loadingreadyrun', url: twUrl('loadingreadyrun') },
    ],
  },
  {
    slug: 'amazonian',
    displayName: 'Amazonian',
    handle: 'amazonian',
    bio: 'Amy "Amazonian" Brady — Limited specialist and streamer. Detailed draft pick orders, sealed pool analysis, and competitive Limited event coverage.',
    regionCode: 'us-east',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'amazonian', url: twUrl('amazonian') },
    ],
  },
  {
    slug: 'crokeyz',
    displayName: 'Crokeyz',
    handle: 'crokeyz',
    bio: 'Standard and Pioneer competitive grinder. Fast ladder climbs, new-set brews, and competitive deck testing streamed live almost daily.',
    regionCode: 'us-east',
    primaryFormatCode: 'standard',
    primaryContentTagCode: 'competitive',
    formats: ['standard', 'pioneer'],
    tags: ['competitive', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'crokeyz', url: ytUrl('crokeyz') },
      { platform: 'twitch', handle: 'crokeyz', url: twUrl('crokeyz') },
    ],
  },
  {
    slug: 'andrea-mengucci',
    displayName: 'Andrea Mengucci',
    handle: 'mengucci',
    bio: 'Italian Magic World Championship competitor and Limited/Constructed expert. In-depth set reviews, draft guides, and regular competitive play on Twitch.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'standard'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'mengucci', url: ytUrl('mengucci') },
      { platform: 'twitch', handle: 'mengucci', url: twUrl('mengucci') },
    ],
  },
  {
    slug: 'gaby-spartz',
    displayName: 'Gaby Spartz',
    handle: 'gabyspartz',
    bio: 'Competitive streamer, commentator, and Limited specialist. Regular Arena ladder streams and in-depth set analysis from a Hall of Fame-adjacent perspective.',
    regionCode: 'us-east',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'standard'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'gabyspartz', url: twUrl('gabyspartz') },
    ],
  },
  {
    slug: 'emma-handy',
    displayName: 'Emma Handy',
    handle: 'emmahandy',
    bio: 'Modern and Limited competitor with deep format knowledge. Strategy articles, Twitch streams, and analytical breakdowns of competitive metagames.',
    regionCode: 'us-south',
    primaryFormatCode: 'modern',
    primaryContentTagCode: 'competitive',
    formats: ['modern', 'limited'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'emmahandy', url: twUrl('emmahandy') },
    ],
  },
  {
    slug: 'autumn-burchett',
    displayName: 'Autumn Burchett',
    handle: 'autumnlily',
    bio: 'Mythic Championship winner and Limited expert. Thoughtful competitive content, draft streams, and advocacy for inclusive spaces in competitive MTG.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'standard'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'autumnlily', url: twUrl('autumnlily') },
    ],
  },
  {
    slug: 'jess-estephan',
    displayName: 'Jess Estephan',
    handle: 'jestephan',
    bio: 'Australian Limited specialist and competitive grinder. Grand Prix champion, Twitch streamer, and advocate for inclusive competitive Magic.',
    regionCode: 'asia-pacific',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'jestephan', url: twUrl('jestephan') },
    ],
  },
  {
    slug: 'paul-cheon',
    displayName: 'Paul Cheon',
    handle: 'haumph',
    bio: 'Pro Tour Top 8 competitor and beloved Limited streamer. Known as "haumph" on stream — expert pick orders and competitive Limited play with great energy.',
    regionCode: 'us-west',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'haumph', url: twUrl('haumph') },
    ],
  },
  {
    slug: 'lsv',
    displayName: 'Luis Scott-Vargas',
    handle: 'lsv',
    bio: 'One of the greatest MTG players ever. Multiple Pro Tour Top 8s, Hall of Famer. Regular streamer covering Limited, Legacy, and competitive formats.',
    regionCode: 'us-west',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'legacy'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'twitch', handle: 'lsv', url: twUrl('lsv') },
    ],
  },
  {
    slug: 'bmkibler',
    displayName: 'Brian Kibler',
    handle: 'bmkibler',
    bio: 'Hall of Fame player, Pro Tour champion, and veteran streamer. Known as the "Dragonmaster" — covers Standard, Modern, and Limited on Twitch and YouTube.',
    regionCode: 'us-east',
    primaryFormatCode: 'standard',
    primaryContentTagCode: 'competitive',
    formats: ['standard', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'bmkibler', url: ytUrl('bmkibler') },
      { platform: 'twitch', handle: 'bmkibler', url: twUrl('bmkibler') },
    ],
  },

  // ── Variety / Modern / Pioneer ───────────────────────────────────────────────
  {
    slug: 'strictly-better-mtg',
    displayName: 'Strictly Better MTG',
    handle: 'strictlybettermtg',
    bio: 'Modern and Pioneer competitive content. Metagame analysis, deck guides, and weekly tournament results breakdowns for the 60-card competitive crowd.',
    regionCode: 'us-east',
    primaryFormatCode: 'modern',
    primaryContentTagCode: 'competitive',
    formats: ['modern', 'pioneer'],
    tags: ['competitive', 'analytical'],
    socials: [
      { platform: 'youtube', handle: 'StrictlyBetterMtg', url: ytUrl('StrictlyBetterMtg') },
    ],
  },
  {
    slug: 'saffron-olive',
    displayName: 'SaffronOlive',
    handle: 'saffronolive',
    bio: 'Budget jank brewer and MTGGoldfish face. Budget deck techs, tier list videos, and the "Against the Odds" series testing wild builds in Modern and Pioneer.',
    regionCode: 'us-east',
    primaryFormatCode: 'modern',
    primaryContentTagCode: 'budget',
    formats: ['modern', 'pioneer'],
    tags: ['budget', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'SaffronOlive', url: ytUrl('SaffronOlive') },
    ],
  },
  {
    slug: 'merchant',
    displayName: 'Merchant',
    handle: 'merchantmtg',
    bio: 'UK-based competitive variety content creator. Modern, Pioneer, and Arena content with a focus on metagame positioning and competitive deck building.',
    regionCode: 'eu',
    primaryFormatCode: 'modern',
    primaryContentTagCode: 'competitive',
    formats: ['modern', 'pioneer'],
    tags: ['competitive', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'Merchant', url: ytUrl('Merchant') },
    ],
  },

  // ── Vorthos / Design ─────────────────────────────────────────────────────────
  {
    slug: 'rhystic-studies',
    displayName: 'Rhystic Studies',
    handle: 'rhysticstudies',
    bio: 'Essay-driven explorations of MTG card design, art direction, and world-building. The definitive Vorthos video channel — beautifully produced deep dives.',
    regionCode: 'canada',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'vorthos',
    formats: ['edh'],
    tags: ['vorthos', 'casual'],
    socials: [
      { platform: 'youtube', handle: 'rhysticstudies', url: ytUrl('rhysticstudies') },
    ],
  },

  // ── WotC Creator ─────────────────────────────────────────────────────────────
  {
    slug: 'good-morning-magic',
    displayName: 'Good Morning Magic',
    handle: 'goodmorningmagic',
    bio: 'Daily MTG news and previews from Gavin Verhey, Wizards of the Coast senior designer. Set previews, rules Q&A, and product deep-dives direct from inside WotC.',
    regionCode: 'us-west',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'beginner',
    formats: ['edh', 'limited'],
    tags: ['beginner', 'casual'],
    socials: [
      { platform: 'youtube', handle: 'GoodMorningMagic', url: ytUrl('GoodMorningMagic') },
    ],
  },

  // ── Finance / Spikes ─────────────────────────────────────────────────────────
  {
    slug: 'alpha-investments',
    displayName: 'Alpha Investments',
    handle: 'alphainvestments',
    bio: 'Rudy Briksza covers MTG finance, speculation, and product economics. Deep dives into booster box EV, reserved list theory, and the card market.',
    regionCode: 'us-east',
    primaryFormatCode: 'other',
    primaryContentTagCode: 'analytical',
    formats: ['other'],
    tags: ['analytical', 'spike'],
    socials: [
      { platform: 'youtube', handle: 'AlphaInvestments', url: ytUrl('AlphaInvestments') },
    ],
  },

  // ── Community / Database ─────────────────────────────────────────────────────
  {
    slug: 'edhrec',
    displayName: 'EDHREC',
    handle: 'edhrec',
    bio: 'The data engine of Commander. EDHREC\'s YouTube channel covers card recommendations, commander tier lists, and budget synergy breakdowns powered by their database.',
    regionCode: 'us-east',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'analytical',
    formats: ['edh'],
    tags: ['analytical', 'brewing'],
    socials: [
      { platform: 'youtube', handle: 'EDHREC', url: ytUrl('EDHREC') },
    ],
  },
  {
    slug: 'edhrecast',
    displayName: 'EDHRECast',
    handle: 'edhrecast',
    bio: 'The official EDHREC podcast covering new card evaluations, Commander theory, and deep dives into the most-played cards and commanders in the format.',
    regionCode: 'us-east',
    primaryFormatCode: 'edh',
    primaryContentTagCode: 'analytical',
    formats: ['edh'],
    tags: ['analytical', 'casual'],
    socials: [],
  },

  // ── Hall of Famers / Pro Players (profile-only — no confirmed social handles) ─
  {
    slug: 'reid-duke',
    displayName: 'Reid Duke',
    handle: 'reidduke',
    bio: 'Hall of Famer and author of the legendary "Level One" series. One of the most respected voices in competitive Magic — Limited and Modern specialist.',
    regionCode: 'us-east',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'analytical',
    formats: ['limited', 'modern'],
    tags: ['analytical', 'competitive'],
    socials: [],
  },
  {
    slug: 'pvddr',
    displayName: 'Paulo Vitor Damo da Rosa',
    handle: 'pvddr',
    bio: 'World Champion, Hall of Famer, and widely considered one of the greatest players of all time. Brazilian Limited and Constructed specialist with an unmatched tournament record.',
    regionCode: 'latam',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'marshall-sutcliffe',
    displayName: 'Marshall Sutcliffe',
    handle: 'marshall-lr',
    bio: 'Co-host of Limited Resources, the premier Limited-format podcast. Marshall has been teaching players how to draft for over a decade.',
    regionCode: 'us-west',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'analytical',
    formats: ['limited'],
    tags: ['analytical', 'competitive'],
    socials: [],
  },
  {
    slug: 'cedric-phillips',
    displayName: 'Cedric Phillips',
    handle: 'cedricaphillips',
    bio: 'Veteran MTG commentator, caster, and content creator. Former SCG Tour grinder turned prolific host — covers Modern, Legacy, and the competitive scene.',
    regionCode: 'us-east',
    primaryFormatCode: 'modern',
    primaryContentTagCode: 'competitive',
    formats: ['modern', 'legacy'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'patrick-sullivan',
    displayName: 'Patrick Sullivan',
    handle: 'patternsofplay',
    bio: 'Legacy and Pauper specialist, veteran commentator, and MTG theory writer. Known for aggressive deck mastery and thoughtful game theory writing.',
    regionCode: 'us-east',
    primaryFormatCode: 'legacy',
    primaryContentTagCode: 'competitive',
    formats: ['legacy', 'pauper'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'frank-karsten',
    displayName: 'Frank Karsten',
    handle: 'frankkarsten',
    bio: 'Hall of Famer and the "Math Guy" of competitive Magic. His probability and mana-base articles on ChannelFireball are required reading for competitive players.',
    regionCode: 'eu',
    primaryFormatCode: 'modern',
    primaryContentTagCode: 'analytical',
    formats: ['modern', 'vintage'],
    tags: ['analytical', 'competitive'],
    socials: [],
  },
  {
    slug: 'ben-stark',
    displayName: 'Ben Stark',
    handle: 'benstark',
    bio: 'Hall of Famer and one of the all-time great Limited players. Pro Tour champion known for methodical draft reads and tight technical play.',
    regionCode: 'us-east',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'william-jensen',
    displayName: 'William Jensen',
    handle: 'hueyj',
    bio: 'Hall of Famer ("Huey") and consistent top-level competitor. Known for deep Limited expertise and strong Constructed finishes across multiple formats.',
    regionCode: 'us-west',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'gabriel-nassif',
    displayName: 'Gabriel Nassif',
    handle: 'yellowhat',
    bio: 'French Hall of Famer known as "Yellowhat." Pro Tour champion, Legacy specialist, and long-running streamer known for meticulous technical play.',
    regionCode: 'eu',
    primaryFormatCode: 'legacy',
    primaryContentTagCode: 'competitive',
    formats: ['legacy', 'vintage'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'ondrej-strasky',
    displayName: 'Ondřej Stráský',
    handle: 'ondrejstrasky',
    bio: 'Czech Hall of Famer and consistent Pro Tour performer. Known for creative deck selection, strong Standard results, and a disciplined competitive approach.',
    regionCode: 'eu',
    primaryFormatCode: 'standard',
    primaryContentTagCode: 'competitive',
    formats: ['standard', 'modern'],
    tags: ['competitive', 'brewing'],
    socials: [],
  },
  {
    slug: 'edgar-magalhaes',
    displayName: 'Edgar Magalhães',
    handle: 'edgarmagalhaes',
    bio: 'Canadian Hall of Famer and Limited specialist. Known for consistent deep Pro Tour runs and clean technical play across Limited and Constructed.',
    regionCode: 'canada',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'eli-loveman',
    displayName: 'Eli Loveman',
    handle: 'eliloveman',
    bio: 'Vintage and Legacy specialist with strong paper results. Deep knowledge of eternal formats and one of the most respected voices in non-rotating Constructed.',
    regionCode: 'us-east',
    primaryFormatCode: 'vintage',
    primaryContentTagCode: 'competitive',
    formats: ['vintage', 'legacy'],
    tags: ['competitive', 'spike'],
    socials: [],
  },
  {
    slug: 'grzegorz-kowalski',
    displayName: 'Grzegorz Kowalski',
    handle: 'grzegorz-kowalski',
    bio: 'Polish Hall of Famer with multiple Pro Tour Top 8s. Known for precise Limited play and consistent Constructed results on the international stage.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'martin-juza',
    displayName: 'Martin Jůza',
    handle: 'martinjuza',
    bio: 'Czech Hall of Famer and one of the greatest Limited players in Magic history. Tireless Pro Tour grinder known for deep set evaluation and technical mastery.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'lukas-blohon',
    displayName: 'Lukas Blohon',
    handle: 'lukasblohon',
    bio: 'Czech Pro Tour champion and Limited specialist. Consistent top-level performer known for clean, disciplined play and careful metagame preparation.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'christoffer-bjorklund',
    displayName: 'Christoffer Björklund',
    handle: 'cbjorklund',
    bio: 'Swedish Hall of Famer with multiple Pro Tour Top 8s. Strong across Limited and Constructed formats with consistent results on the Grand Prix circuit.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'modern'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'jean-ruel',
    displayName: 'Jérémy Dezani',
    handle: 'jeremydezani',
    bio: 'French Pro Tour champion and Limited expert. Known for methodical draft reads and high-level play on the European and international circuits.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
  {
    slug: 'raph-levy',
    displayName: 'Raphaël Lévy',
    handle: 'raphaellevy',
    bio: 'French Hall of Famer and the all-time GP win record holder. Veteran Pro Tour competitor with decades of top-level play across every format.',
    regionCode: 'eu',
    primaryFormatCode: 'limited',
    primaryContentTagCode: 'competitive',
    formats: ['limited', 'legacy'],
    tags: ['competitive', 'analytical'],
    socials: [],
  },
]

async function seedRealCreators() {
  console.log('Seeding real MTG creators…')

  // Load reference data
  const [regionRows, formatRows, tagRows] = await Promise.all([
    db.select().from(schema.regions),
    db.select().from(schema.formatTags),
    db.select().from(schema.contentTags),
  ])

  const regionByCode = Object.fromEntries(regionRows.map((r) => [r.code, r]))
  const formatByCode = Object.fromEntries(formatRows.map((f) => [f.code, f]))
  const tagByCode = Object.fromEntries(tagRows.map((t) => [t.code, t]))

  let created = 0
  let skipped = 0

  for (const c of creators) {
    // Check if slug already exists
    const existing = await db.query.creatorProfiles.findFirst({
      where: eq(schema.creatorProfiles.slug, c.slug),
      columns: { id: true },
    })

    if (existing) {
      console.log(`  ~ ${c.displayName} (already exists)`)
      skipped++
      continue
    }

    const regionId = regionByCode[c.regionCode]?.id ?? null
    const primaryFormatId = formatByCode[c.primaryFormatCode]?.id ?? null
    const primaryContentTagId = tagByCode[c.primaryContentTagCode]?.id ?? null

    const [profile] = await db
      .insert(schema.creatorProfiles)
      .values({
        slug: c.slug,
        displayName: c.displayName,
        handle: c.handle,
        bio: c.bio,
        regionId,
        primaryFormatId,
        primaryContentTagId,
        published: false,
        verified: false,
      })
      .returning()

    // Formats junction
    const formatObjs = c.formats.map((code) => formatByCode[code]).filter(Boolean)
    if (formatObjs.length > 0) {
      await db.insert(schema.creatorFormats).values(
        formatObjs.map((f) => ({ creatorId: profile.id, formatId: f.id }))
      )
    }

    // Tags junction
    const tagObjs = c.tags.map((code) => tagByCode[code]).filter(Boolean)
    if (tagObjs.length > 0) {
      await db.insert(schema.creatorContentTags).values(
        tagObjs.map((t) => ({ creatorId: profile.id, tagId: t.id }))
      )
    }

    // Social accounts
    if (c.socials.length > 0) {
      await db.insert(schema.socialAccounts).values(
        c.socials.map((s) => ({
          creatorId: profile.id,
          platform: s.platform,
          handle: s.handle,
          url: s.url,
          followers: 0,
        }))
      )
    }

    console.log(`  ✓ ${c.displayName}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped (already existed).`)
}

seedRealCreators().catch((err) => {
  console.error(err)
  process.exit(1)
})
