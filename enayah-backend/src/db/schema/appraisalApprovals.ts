import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core'
import { employeeAppraisals } from './employeeAppraisals'

export const appraisalApprovals = pgTable('appraisal_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),

  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'cascade' }),

  userId: uuid('user_id').notNull(),

  role: varchar('role', { length: 50 }).notNull(), // manager | employee | hr

  action: varchar('action', { length: 50 }).notNull(), // submit | acknowledge | approve

  remarks: text('remarks'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
