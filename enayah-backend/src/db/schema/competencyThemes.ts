import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { competencyLibrary } from './competencyLibrary'

export const competencyThemes = pgTable('competency_themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencyId: uuid('competency_id')
    .notNull()
    .references(() => competencyLibrary.id, { onDelete: 'restrict' }),
  themeNameEn: varchar('theme_name_en', { length: 255 }).notNull(),
  themeNameAr: varchar('theme_name_ar', { length: 255 }).notNull(),
  behavioralDescriptionEn: text('behavioral_description_en'),
  behavioralDescriptionAr: text('behavioral_description_ar'),
  ...baseColumns,
})
