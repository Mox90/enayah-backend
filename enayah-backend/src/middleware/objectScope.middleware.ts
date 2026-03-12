import { Request, Response, NextFunction } from 'express'
import { db } from '../db'
import { employees } from '../db/schema'
import { AppError } from '../utils/AppError'
import { eq } from 'drizzle-orm'
import { getAllSubordinates } from '../modules/employees/hierarchy.service'
import { logAnomaly } from '../modules/anomalies/anomaly.services'
import { ANOMALY_TYPES } from '../modules/anomalies/anomaly.types'
import { securityLogger } from '../config/securityLogger'

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

  // ✅ EMPLOYEE → SELF ONLY
  if (role === 'employee') {
    if (target.id !== employeeId) {
      await logAnomaly(
        ANOMALY_TYPES.FORBIDDEN_OBJECT_ACCESS,
        {
          userId: employeeId,
          targetId: id,
          role,
          endpoint: req.originalUrl,
          method: req.method,
          ip: req.ip,
        },
        'HIGH',
      )

      /*securityLogger.warn('FORBIDDEN_ACCESS', {
        userId: employeeId,
        targetId: id,
        role,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
      })*/

      throw new AppError('Forbidden', 403)
    }

    return next()
  }

  // ⭐ DIRECTOR + MANAGER → hierarchy ONLY
  if (role === 'director' || role === 'manager') {
    if (!employeeId) throw new AppError('Forbidden', 403)

    const subs = await getAllSubordinates(employeeId)

    if (!subs.includes(id) && id !== employeeId) {
      await logAnomaly(
        ANOMALY_TYPES.FORBIDDEN_OBJECT_ACCESS,
        {
          userId: employeeId,
          targetId: id,
          role,
        },
        'HIGH',
      )

      securityLogger.warn('FORBIDDEN_ACCESS', {
        userId: employeeId,
        targetId: id,
        role,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
      })

      throw new AppError('Forbidden', 403)
    }

    return next()
  }

  /*if (role === 'employee') {
    if (target.id !== employeeId) {
      throw new AppError('Forbidden', 403)
    }
    return next()
  }*/

  throw new AppError('Forbidden', 403)
}
