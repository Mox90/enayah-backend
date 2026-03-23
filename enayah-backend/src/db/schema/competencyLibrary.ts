import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const competencyLibrary = pgTable('competency_library', {
  id: uuid('id').defaultRandom().primaryKey(),

  domainEn: varchar('domain_en', { length: 255 }).notNull(),
  domainAr: varchar('domain_ar', { length: 255 }).notNull(),

  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),

  ...baseColumns,
})
