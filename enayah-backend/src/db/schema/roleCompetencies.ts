import { pgTable, uuid, integer, text } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { competencyLibrary } from './competencyLibrary'

export const roleCompetencies = pgTable('role_competencies', {
  id: uuid('id').defaultRandom().primaryKey(),

  role: text('role').notNull(), // e.g. 'nurse', 'doctor'
  competencyId: uuid('competency_id')
    .notNull()
    .references(() => competencyLibrary.id),

  expectedLevel: integer('expected_level'),

  ...baseColumns,
})
