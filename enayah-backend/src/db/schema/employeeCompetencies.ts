import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { competencyLibrary } from './competencyLibrary'
import { employeeAppraisals } from './employeeAppraisals'
import { baseColumns } from './base'

export const employeeCompetencies = pgTable(
  'employee_competencies',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    appraisalId: uuid('appraisal_id')
      .notNull()
      .references(() => employeeAppraisals.id),

    competencyId: uuid('competency_id')
      .notNull()
      .references(() => competencyLibrary.id),

    relativeWeight: numeric('relative_weight').notNull(),
    fulfillmentRating: integer('fulfillment_rating'),
    weightedScore: numeric('weighted_score'),

    ...baseColumns,
  },
  (table) => ({
    uniqueAssignment: uniqueIndex('emp_comp_unique').on(
      table.appraisalId,
      table.competencyId,
    ),
  }),
)
