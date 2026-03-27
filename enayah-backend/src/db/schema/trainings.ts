import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const trainings = pgTable('trainings', {
  id: uuid('id').defaultRandom().primaryKey(),

  title: text('title').notNull(),
  description: text('description'),

  // 🔥 maps to competency
  competencyId: uuid('competency_id').notNull(),

  // optional difficulty level
  level: text('level').$type<'basic' | 'intermediate' | 'advanced'>(),

  durationHours: integer('duration_hours'),

  ...baseColumns,
})
