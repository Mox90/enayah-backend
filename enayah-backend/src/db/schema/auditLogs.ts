import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: uuid('record_id').notNull(),

  action: varchar('action', { length: 20 }).notNull(),

  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),

  performedBy: uuid('performed_by'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
