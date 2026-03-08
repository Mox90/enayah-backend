import { db } from '../../db'
import { employees } from '../../db/schema'
import { eq, ilike, and, or, inArray } from 'drizzle-orm'
import { AppError } from '../../utils/AppError'
import { getPagination } from '../../utils/pagination'
import { getAllSubordinates } from './hierarchy.service'

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

export const createEmployee = async (data: any) => {
  const [employee] = await db.insert(employees).values(data).returning()
  return employee
}

export const updateEmployee = async (id: string, data: any) => {
  const [updated] = await db
    .update(employees)
    .set(data)
    .where(eq(employees.id, id))
    .returning()

  if (!updated) throw new AppError('Employee not found', 404)

  return updated
}

export const deleteEmployee = async (id: string) => {
  const deleted = await db.delete(employees).where(eq(employees.id, id))

  if (!deleted) throw new AppError('Employee not found', 404)

  return true
}
