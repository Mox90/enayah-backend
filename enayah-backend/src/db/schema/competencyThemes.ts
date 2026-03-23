import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const competencyThemes = pgTable('competency_themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencyId: uuid('competency_id').notNull(),
  themeNameEn: varchar('theme_name_en', { length: 255 }).notNull(),
  themeNameAr: varchar('theme_name_ar', { length: 255 }).notNull(),
  behavioralDescriptionEn: text('behavioral_description_en'),
  behavioralDescriptionAr: text('behavioral_description_ar'),
  ...baseColumns,
})
