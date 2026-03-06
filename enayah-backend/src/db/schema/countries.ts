import { char, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const countries = pgTable('countries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
  nationalityEn: varchar('nationality_en', { length: 100 }), // Saudi
  nationalityAr: varchar('nationality_ar', { length: 100 }), // سعودي
  alpha2: char('alpha2', { length: 2 }).notNull(),
  alpha3: char('alpha3', { length: 3 }).notNull().unique(),
  numericCode: char('numeric_code', { length: 3 }).notNull().unique(),
  ...baseColumns,
})
