import { pgTable, uuid, integer, text } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const roleCompetencies = pgTable('role_competencies', {
  id: uuid('id').defaultRandom().primaryKey(),

  role: text('role').notNull(), // e.g. 'nurse', 'doctor'
  competencyId: uuid('competency_id').notNull(),

  expectedLevel: integer('expected_level'),

  ...baseColumns,
})
