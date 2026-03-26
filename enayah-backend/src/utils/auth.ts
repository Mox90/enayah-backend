import { AppError } from './AppError'
import { Request } from 'express'

/*
export const requireRoles = (req: Request, roles: string[]) => {
  const role = req.user?.role

  if (!role || !roles.includes(role)) {
    throw new AppError('Unauthorized role', 403)
  }

  if (!req.user || !req.user.employeeId) {
    throw new AppError('User must be linked to employee', 403)
  }

  const { employeeId } = req.user
  return employeeId
}*/

export const requireUser = (req: Request) => {
  if (!req.user) {
    throw new AppError('Unauthenticated', 401)
  }

  return req.user
}

export const requireEmployee = (req: Request): string => {
  const user = requireUser(req)

  if (!user.employeeId) {
    throw new AppError('User must be linked to employee', 403)
  }

  return user.employeeId
}

export const requireManager = (req: Request): string => {
  const user = requireUser(req)

  if (!['manager', 'director'].includes(user.role)) {
    throw new AppError('Manager or Director role required', 403)
  }

  if (!user.employeeId) {
    throw new AppError('User must be linked to employee', 403)
  }

  return user.employeeId
}

export const requireHR = (req: Request): string => {
  const user = requireUser(req)

  if (user.role !== 'hr') {
    throw new AppError('HR role required', 403)
  }

  //if (!user.employeeId) {
  //  throw new AppError('User must be linked to employee', 403)
  //}

  return user.id
}

export const requireAdmin = (req: Request): string => {
  const user = requireUser(req)

  if (user.role !== 'admin') {
    throw new AppError('Admin role required', 403)
  }

  if (!user.employeeId) {
    throw new AppError('User must be linked to employee', 403)
  }

  return user.employeeId
}
