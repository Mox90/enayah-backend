import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const anomalyLogs = pgTable('anomaly_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id'),
  type: varchar('type', { length: 50 }).notNull(),

  severity: varchar('severity', { length: 10 }).notNull(),
  status: varchar('status', { length: 10 }).default('OPEN'),

  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
