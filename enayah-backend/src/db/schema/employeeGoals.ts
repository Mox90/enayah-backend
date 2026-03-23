import { pgTable, uuid, text, numeric, integer } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { employeeAppraisals } from './employeeAppraisals'

export const employeeGoals = pgTable('employee_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  measurementStandard: text('measurement_standard'),
  relativeWeight: numeric('relative_weight').notNull(),
  targetOutput: text('target_output'),
  fulfillmentRating: integer('fulfillment_rating'),
  weightedScore: numeric('weighted_score'),
  ...baseColumns,
})
