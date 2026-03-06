import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const positions = pgTable('positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  description: varchar('description', { length: 255 }),
  ...baseColumns,
})
