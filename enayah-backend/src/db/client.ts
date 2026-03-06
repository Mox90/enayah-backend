import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { Pool } from 'pg'
import { env } from '../config/env'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV !== 'production',
})

export { pool }
