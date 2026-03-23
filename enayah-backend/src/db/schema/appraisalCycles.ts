import { pgTable, integer, timestamp, numeric, uuid } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const appraisalCycles = pgTable('appraisal_cycles', {
  id: uuid('id').defaultRandom().primaryKey(),
  year: integer('year').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  goalsWeight: numeric('goals_weight').default('50'),
  competenciesWeight: numeric('competencies_weight').default('50'),
  ...baseColumns,
})
