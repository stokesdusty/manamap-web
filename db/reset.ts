import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { sql } from 'drizzle-orm'

const client = neon(process.env.DATABASE_URL!)
const db = drizzle(client)

async function reset() {
  console.log('Dropping public schema…')
  await db.execute(sql`DROP SCHEMA public CASCADE`)
  await db.execute(sql`CREATE SCHEMA public`)
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public`)
  console.log('Done. Run: npm run db:migrate && npm run db:seed')
}

reset().catch((err) => {
  console.error(err)
  process.exit(1)
})
