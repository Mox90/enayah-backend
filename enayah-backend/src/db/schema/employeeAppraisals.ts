import { pgTable, uuid, numeric, varchar, text } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { appraisalStatusEnum } from './enums'
import { employees } from './employees'
import { appraisalCycles } from './appraisalCycles'

export const employeeAppraisals = pgTable('employee_appraisals', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'restrict' }),
  cycleId: uuid('cycle_id')
    .notNull()
    .references(() => appraisalCycles.id, { onDelete: 'restrict' }),
  appraiserId: uuid('appraiser_id').references(() => employees.id),
  employeeNumberSnapshot: varchar('employee_number_snapshot', { length: 50 }),
  employeeNameSnapshot: varchar('employee_name_snapshot', { length: 255 }),
  jobTitleSnapshot: varchar('job_title_snapshot', { length: 255 }),
  departmentSnapshot: varchar('department_snapshot', { length: 255 }),
  goalsScore: numeric('goals_score'),
  competenciesScore: numeric('competencies_score'),
  finalScore: numeric('final_score'),
  overallRating: varchar('overall_rating', { length: 100 }),
  status: appraisalStatusEnum('status').default('draft'),
  strengths: text('strengths'),
  developmentAreas: text('development_areas'),
  comments: text('comments'),
  ...baseColumns,
})
