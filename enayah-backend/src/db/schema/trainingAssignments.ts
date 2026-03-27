import { pgTable, uuid, timestamp, text, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { trainings } from './trainings'
import { employees } from './employees'

export const trainingAssignments = pgTable('training_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id),

  trainingId: uuid('training_id')
    .notNull()
    .references(() => trainings.id),
  priority: text('priority').$type<'high' | 'medium' | 'low'>(),
  aiReason: text('ai_reason'),
  horizon: varchar('horizon', { length: 50 }),
  dueDate: timestamp('due_date'),

  completedAt: timestamp('completed_at'),

  ...baseColumns,
})
