import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { pipLevelEnum, pipStatusEnum } from './enums'
import { employeeAppraisals } from './employeeAppraisals'

export const performanceImprovementPlans = pgTable('pips', {
  id: uuid('id').defaultRandom().primaryKey(),
  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'restrict' }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  objectives: text('objectives'),
  actionPlan: text('action_plan'), // 🔥 ADD
  reviewFrequency: varchar('review_frequency', { length: 50 }), // weekly/monthly
  assignedTo: uuid('assigned_to'), // manager
  successCriteria: text('success_criteria'),
  status: pipStatusEnum('status').default('active'),
  level: pipLevelEnum('level').default('moderate'),
  ...baseColumns,
})
