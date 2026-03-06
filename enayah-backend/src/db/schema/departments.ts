import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  logo: varchar('logo', { length: 255 }),
  parentDepartmentId: uuid('parent_department_id').references(
    (): any => departments.id,
    { onDelete: 'restrict' },
  ),
  level: integer('level').default(1).notNull(),
  ...baseColumns,
})
