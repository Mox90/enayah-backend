import { db } from '../../db'
import { auditLogs, employees } from '../../db/schema'
import { eq, ilike, and, or, inArray } from 'drizzle-orm'
import { AppError } from '../../utils/AppError'
import { getPagination } from '../../utils/pagination'
import { getAllSubordinates } from './hierarchy.service'
import { getChangedFields } from '../../utils/diff'

const activeEmployeeWhere = (id: string) =>
  and(eq(employees.id, id), eq(employees.isDeleted, false))

export const listEmployees = async (query: any) => {
  const { page, limit, search, departmentId, employeeId, managerId, role } =
    query

  const { offset } = getPagination(page, limit)

  const filters = []

  if (search) {
    filters.push(ilike(employees.firstName, `%${search}%`))
  }

  if (role === 'employee' && employeeId) {
    filters.push(eq(employees.id, employeeId))
  }
  // ⭐ HIERARCHY FILTER (DIRECTOR / MANAGER)
  else if ((role === 'director' || role == 'manager') && employeeId) {
    const descendants = await getAllSubordinates(employeeId)

    //console.log('DESCENDANTS ', descendants)

    filters.push(
      or(
        eq(employees.id, employeeId), // self
        inArray(employees.id, descendants),
      ),
    )
  }

  //console.log('FILTERS ', filters)
  //console.log('QUERY ', query)

  return db.query.employees.findMany({
    where: and(
      eq(employees.isDeleted, false),
      ...(filters.length ? filters : []),
    ),
    limit,
    offset,
  })
}

export const getEmployeeById = async (id: string) => {
  const employee = await db.query.employees.findFirst({
    where: activeEmployeeWhere(id),
  })

  if (!employee) throw new AppError('Employee not found', 404)

  return employee
}

export const createEmployee = async (data: any, userId?: string) => {
  return db.transaction(async (tx) => {
    const [employee] = await tx.insert(employees).values(data).returning()

    if (!employee) throw new AppError('Create failed', 500)

    const changes = getChangedFields({}, employee)

    for (const c of changes) {
      await tx.insert(auditLogs).values({
        tableName: 'employees',
        recordId: employee.id,
        fieldName: c.field,
        oldValue: null,
        newValue: c.newValue, //(employee as any)[key],
        action: 'CREATE',
        performedBy: userId ?? null,
      })
    }

    return employee
  })
}

export const updateEmployee = async (
  id: string,
  data: any,
  userId?: string,
) => {
  return db.transaction(async (tx) => {
    const existing = await tx.query.employees.findFirst({
      where: and(eq(employees.id, id), eq(employees.isDeleted, false)),
    })

    if (!existing) throw new AppError('Employee not found', 404)

    const [updated] = await tx
      .update(employees)
      .set({ ...data, version: existing.version + 1 })
      .where(
        and(
          eq(employees.id, id),
          eq(employees.version, data.version),
          eq(employees.isDeleted, false),
        ),
      )
      .returning()

    if (!updated)
      throw new AppError(
        'This record was updated by another user. Please refresh and try again.',
        409,
      )

    const changes = getChangedFields(existing, updated)

    for (const c of changes) {
      await tx.insert(auditLogs).values({
        tableName: 'employees',
        recordId: id,
        fieldName: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
        action: 'UPDATE',
        performedBy: userId ?? null,
      })
    }

    return updated
  })
}

export const deleteEmployee = async (id: string, userId?: string) => {
  return db.transaction(async (tx) => {
    const existing = await tx.query.employees.findFirst({
      where: activeEmployeeWhere(id),
    })

    if (!existing) throw new AppError('Employee not found', 404)

    const [updated] = await tx
      .update(employees)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId ?? null,
        version: existing.version + 1,
      })
      .where(activeEmployeeWhere(id))
      .returning()

    if (!updated) throw new AppError('Delete failed', 500)

    const changes = getChangedFields(existing, updated)

    for (const c of changes) {
      await tx.insert(auditLogs).values({
        tableName: 'employees',
        recordId: id,
        fieldName: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
        action: 'DELETE',
        performedBy: userId ?? null,
      })
    }

    return true
  })
}
