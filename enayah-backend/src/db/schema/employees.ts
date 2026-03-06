import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { countries } from './countries'
import { departments } from './departments'
import { positions } from './positions'
import { genderEnum } from './enums'

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeNumber: varchar('employee_number', { length: 10 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  secondName: varchar('second_name', { length: 100 }),
  thirdName: varchar('third_name', { length: 100 }),
  familyName: varchar('family_name', { length: 100 }).notNull(),
  firstNameAr: varchar('first_name_ar', { length: 100 }).notNull(),
  secondNameAr: varchar('second_name_ar', { length: 100 }),
  thirdNameAr: varchar('third_name_ar', { length: 100 }),
  familyNameAr: varchar('family_name_ar', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  gender: genderEnum('gender'),
  nationality: uuid('country_id').references((): any => countries.id, {
    onDelete: 'restrict',
  }),
  positionId: uuid('position_id')
    .notNull()
    .references(() => positions.id, { onDelete: 'restrict' }),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  managerId: uuid('manager_id').references((): any => employees.id, {
    onDelete: 'restrict',
  }),
  ...baseColumns,
})
