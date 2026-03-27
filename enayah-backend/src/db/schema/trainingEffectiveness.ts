import { pgTable, uuid, timestamp, numeric } from 'drizzle-orm/pg-core'
import { employees } from './employees'
import { trainings } from './trainings'

export const trainingEffectiveness = pgTable('training_effectiveness', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),

  trainingId: uuid('training_id')
    .notNull()
    .references(() => trainings.id, { onDelete: 'cascade' }),

  beforeScore: numeric('before_score'), // rating before training
  afterScore: numeric('after_score'), // rating after next cycle

  improvement: numeric('improvement'), // computed

  createdAt: timestamp('created_at').defaultNow(),
})
