import {
  pgTable,
  uuid,
  numeric,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { appraisalRatingEnum, appraisalStatusEnum } from './enums'
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
  employeeNameArSnapshot: varchar('employee_name_ar_snapshot', { length: 255 }),
  jobTitleSnapshot: varchar('job_title_snapshot', { length: 255 }),
  jobTitleArSnapshot: varchar('job_title_ar_snapshot', { length: 255 }),
  departmentSnapshot: varchar('department_snapshot', { length: 255 }),
  departmentArSnapshot: varchar('department_ar_snapshot', { length: 255 }),
  goalsScore: numeric('goals_score'),
  competenciesScore: numeric('competencies_score'),
  finalScore: numeric('final_score'),
  overallRating: appraisalRatingEnum('overall_rating'),
  status: appraisalStatusEnum('status').default('draft'),
  phase: varchar('phase', { length: 50 }).default('planning'),
  strengths: text('strengths'),
  developmentAreas: text('development_areas'),
  comments: text('comments'),
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: uuid('acknowledged_by'),
  // 🟢 PLANNING SIGNATURES
  planningSubmittedAt: timestamp('planning_submitted_at'),
  planningSubmittedBy: uuid('planning_submitted_by'),

  planningAcknowledgedAt: timestamp('planning_acknowledged_at'),
  planningAcknowledgedBy: uuid('planning_acknowledged_by'),

  // 🔵 FINAL SIGNATURES
  finalSubmittedAt: timestamp('final_submitted_at'),
  finalSubmittedBy: uuid('final_submitted_by'),

  finalAcknowledgedAt: timestamp('final_acknowledged_at'),
  finalAcknowledgedBy: uuid('final_acknowledged_by'),

  // 🟣 HR
  hrApprovedAt: timestamp('hr_approved_at'),
  hrApprovedBy: uuid('hr_approved_by'),

  // OPTIONAL
  isRejected: boolean('is_rejected').default(false),
  rejectionReason: text('rejection_reason'),

  calibratedAt: timestamp('calibrated_at'),
  calibratedBy: uuid('calibrated_by'),

  managerSignedAt: timestamp('manager_signed_at'),
  managerSignedBy: uuid('manager_signed_by'),

  employeeSignedAt: timestamp('employee_signed_at'),
  employeeSignedBy: uuid('employee_signed_by'),

  ...baseColumns,
})
