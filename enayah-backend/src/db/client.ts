import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { Pool } from 'pg'
import { env } from '../config/env'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV !== 'production',
})

export { pool }
