import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core'

export const consentLogs = pgTable('consent_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id'),
  employeeId: uuid('employee_id'),

  consentType: varchar('consent_type', { length: 100 }).notNull(),
  version: varchar('version', { length: 20 }),

  given: boolean('given').notNull(),

  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
