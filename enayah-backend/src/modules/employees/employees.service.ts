import { db } from '../../db'
import { auditLogs, employees } from '../../db/schema'
import { eq, ilike, and, or, inArray } from 'drizzle-orm'
import { AppError } from '../../utils/AppError'
import { getPagination } from '../../utils/pagination'
import { getAllSubordinates } from './hierarchy.service'
import { getChangedFields } from '../../utils/diff'
import { id } from 'zod/locales'

export const listEmployees = async (query: any) => {
  const { page, limit, search, departmentId, employeeId, managerId, role } =
    query

  //console.log(query)
  const { offset } = getPagination(page, limit)

  const filters = []

  if (search) {
    filters.push(ilike(employees.firstName, `%${search}%`))
  }

  // 🔵 Employee (self only)
  //if (employeeId) {
  //  filters.push(eq(employees.id, employeeId))
  //}
  // 🟡 Manager (dept + direct reports)
  //else if (departmentId && managerId) {
  //  filters.push(
  //    or(
  //      eq(employees.departmentId, departmentId),
  //      eq(employees.managerId, managerId),
  //    ),
  //  )
  //}
  // 🟣 Director (dept only)
  //else if (departmentId) {
  //  filters.push(eq(employees.departmentId, departmentId))
  //}

  if (role === 'employee' && employeeId) {
    filters.push(eq(employees.id, employeeId))
  }
  // ⭐ HIERARCHY FILTER (DIRECTOR / MANAGER)
  else if ((role === 'director' || role == 'manager') && employeeId) {
    const descendants = await getAllSubordinates(employeeId)

    filters.push(
      or(
        eq(employees.id, employeeId), // self
        inArray(employees.id, descendants),
      ),
    )
  }

  return db.query.employees.findMany({
    where: filters.length ? and(...filters) : undefined,
    limit,
    offset,
  })
}

export const getEmployeeById = async (id: string) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, id),
  })

  if (!employee) throw new AppError('Employee not found', 404)

  return employee
}

export const createEmployee = async (data: any, userId?: string) => {
  return db.transaction(async (tx) => {
    const [employee] = await tx.insert(employees).values(data).returning()

    if (!employee) throw new AppError('Create failed', 500)

    for (const key of Object.keys(employee)) {
      await tx.insert(auditLogs).values({
        tableName: 'employees',
        recordId: employee.id,
        fieldName: key,
        oldValue: null,
        newValue: (employee as any)[key],
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
      where: eq(employees.id, id),
    })

    if (!existing) throw new AppError('Employee not found', 404)

    if (existing.version !== data.version) {
      throw new AppError('Version conflict', 409)
    }

    const [updated] = await tx
      .update(employees)
      .set({ ...data, version: existing.version + 1 })
      .where(eq(employees.id, id))
      .returning()

    if (!updated) throw new AppError('Update failed', 500)

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
  //const deleted = await db.delete(employees).where(eq(employees.id, id))

  //if (!deleted) throw new AppError('Employee not found', 404)

  //return true
  return db.transaction(async (tx) => {
    const existing = await tx.query.employees.findFirst({
      where: eq(employees.id, id),
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
      .where(eq(employees.id, id))
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
