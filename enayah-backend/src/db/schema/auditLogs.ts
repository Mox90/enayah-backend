import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: uuid('record_id').notNull(),

  fieldName: varchar('field_name', { length: 100 }).notNull(),

  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),

  action: varchar('action', { length: 20 }).notNull(),

  performedBy: uuid('performed_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
