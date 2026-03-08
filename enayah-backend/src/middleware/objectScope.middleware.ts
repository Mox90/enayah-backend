import { Request, Response, NextFunction } from 'express'
import { db } from '../db'
import { employees } from '../db/schema'
import { AppError } from '../utils/AppError'
import { eq } from 'drizzle-orm'
import { getAllSubordinates } from '../modules/employees/hierarchy.service'

export const employeeObjectScope = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) throw new AppError('Unauthorized', 401)

  const rawId = req.params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  if (!id) throw new AppError('Employee ID required', 400)

  const target = await db.query.employees.findFirst({
    where: eq(employees.id, id),
  })

  if (!target) throw new AppError('Not found', 404)

  const { role, employeeId, departmentId } = req.user

  console.log('SELF CHECK:', {
    role,
    urlId: id,
    tokenEmployeeId: employeeId,
  })

  if (role === 'admin' || role === 'hr') return next()

  /*if (role === 'director') {
    if (target.departmentId !== departmentId) {
      throw new AppError('Forbidden', 403)
    }
    return next()
  }

  if (role === 'manager') {
    if (
      target.departmentId !== departmentId &&
      target.managerId !== employeeId
    ) {
      throw new AppError('Forbidden', 403)
    }
    return next()
  }*/

  // ⭐ DIRECTOR + MANAGER → hierarchy ONLY
  if (role === 'director' || role === 'manager') {
    if (!employeeId) throw new AppError('Forbidden', 403)

    const subs = await getAllSubordinates(employeeId)

    if (!subs.includes(id) && id !== employeeId) {
      throw new AppError('Forbidden', 403)
    }

    return next()
  }

  if (role === 'employee') {
    if (target.id !== employeeId) {
      throw new AppError('Forbidden', 403)
    }
    return next()
  }

  throw new AppError('Forbidden', 403)
}
