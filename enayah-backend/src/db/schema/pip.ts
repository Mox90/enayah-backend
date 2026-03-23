import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { pipStatusEnum } from './enums'
import { employeeAppraisals } from './employeeAppraisals'

export const performanceImprovementPlans = pgTable('pips', {
  ...baseColumns,
  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'restrict' }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  objectives: text('objectives'),
  successCriteria: text('success_criteria'),
  status: pipStatusEnum('status').default('active'),
})
