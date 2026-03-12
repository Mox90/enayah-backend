import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core'

export const legalHolds = pgTable('legal_holds', {
  id: uuid('id').defaultRandom().primaryKey(),

  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: uuid('record_id').notNull(),

  reason: text('reason'),
  placedBy: uuid('placed_by'),

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
