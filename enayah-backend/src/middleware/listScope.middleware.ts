import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

export const employeeListScope = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) throw new AppError('Unauthorized', 401)

  //console.log(req.user)

  const { role, employeeId, departmentId } = req.user

  req.scope = {}

  // 👑 ADMIN + HR → see all
  if (role === 'admin' || role === 'hr') return next()

  // 🟣 DIRECTOR → department only
  //if (role === 'director') {
  //req.scope.departmentId = departmentId as string
  //  if (departmentId) req.scope.departmentId = departmentId
  //  return next()
  //}

  // 🟡 MANAGER → department + direct reports
  //if (role === 'manager') {
  //req.scope.departmentId = departmentId as string
  //req.scope.managerId = employeeId as string
  //  if (departmentId) req.scope.departmentId = departmentId
  //  if (employeeId) req.scope.managerId = employeeId
  //  return next()
  //}

  // 🔵 EMPLOYEE → self only
  //if (role === 'employee') {
  //req.scope.employeeId = employeeId as string
  //  if (employeeId) req.scope.employeeId = employeeId
  //  return next()
  //}

  //throw new AppError('Forbidden', 403)
  if (employeeId) req.scope.employeeId = employeeId

  return next()
}
