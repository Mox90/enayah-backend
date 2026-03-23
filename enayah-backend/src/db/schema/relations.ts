import { relations } from 'drizzle-orm'
import { employees } from './employees'
import { positions } from './positions'
import { departments } from './departments'

export const employeesRelations = relations(employees, ({ one }) => ({
  position: one(positions, {
    fields: [employees.positionId],
    references: [positions.id],
  }),

  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
}))
