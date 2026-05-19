import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function run() {
  // ── Look up IDs we need ─────────────────────────────────────────────────

  const [vegasEvent, moxRcqEvent, moxStore] = await Promise.all([
    db.query.events.findFirst({ where: eq(schema.events.slug, 'magiccon-vegas-2026'), columns: { id: true } }),
    db.query.events.findFirst({ where: eq(schema.events.slug, 'mox-bellevue-rcq-jun26'), columns: { id: true } }),
    db.query.stores.findFirst({ where: eq(schema.stores.slug, 'mox-bellevue'), columns: { id: true } }),
  ])

  const [eliCreator, lyraCreator] = await Promise.all([
    db.query.creatorProfiles.findFirst({ where: eq(schema.creatorProfiles.slug, 'eli-bramer'), columns: { id: true } }),
    db.query.creatorProfiles.findFirst({ where: eq(schema.creatorProfiles.slug, 'lyra-vance'), columns: { id: true } }),
  ])

  if (!vegasEvent || !moxRcqEvent || !moxStore || !eliCreator || !lyraCreator) {
    throw new Error('Seed v1 data not found — run db:seed first')
  }

  // ── 1. Schedule items for MagicCon Vegas ────────────────────────────────

  await db.insert(schema.eventScheduleItems).values([
    { eventId: vegasEvent.id, dayLabel: 'FRI', startTime: '10:00', title: 'Pauper meet-up · w/ Lyra Vance & @hauke', locationLabel: 'Booth 312', sortOrder: 0 },
    { eventId: vegasEvent.id, dayLabel: 'FRI', startTime: '14:00', title: 'Nadia Ruiz signing', locationLabel: 'Booth 118', sortOrder: 1 },
    { eventId: vegasEvent.id, dayLabel: 'SAT', startTime: '11:30', title: 'EDH brewing panel · 4 creators', locationLabel: 'Stage A', sortOrder: 2 },
    { eventId: vegasEvent.id, dayLabel: 'SUN', startTime: '09:00', title: 'Modern RCQ · coverage by Eli Bramer', locationLabel: 'Hall 4', sortOrder: 3 },
  ])
  console.log('  ✓ schedule items for MagicCon Vegas')

  // ── 2. Attach Mox RCQ to the Mox Bellevue store ─────────────────────────

  await db.update(schema.events)
    .set({ storeId: moxStore.id })
    .where(eq(schema.events.id, moxRcqEvent.id))
  console.log('  ✓ storeId on Mox Bellevue RCQ event')

  // ── 3. Featured creators at Mox Bellevue ────────────────────────────────

  await db.insert(schema.storeCreators).values([
    { storeId: moxStore.id, creatorId: eliCreator.id,  role: 'Resident', note: null },
    { storeId: moxStore.id, creatorId: lyraCreator.id, role: 'Guest',    note: 'Jul' },
  ])
  console.log('  ✓ store-creator links for Mox Bellevue')

  console.log('\nSeed v2 complete.')
}

run().catch((err) => { console.error(err); process.exit(1) })
