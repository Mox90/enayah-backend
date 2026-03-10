import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const loginLogs = pgTable('login_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id'),
  username: varchar('username', { length: 100 }),

  success: boolean('success').notNull(),

  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: varchar('user_agent', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
