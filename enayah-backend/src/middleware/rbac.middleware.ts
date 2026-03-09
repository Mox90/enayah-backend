import { Request, Response, NextFunction } from 'express'
import { RBAC } from '../config/rbac'
import { AppError } from '../utils/AppError'

export const allowRoles =
  (resource: keyof typeof RBAC, action: keyof (typeof RBAC)['employees']) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError('Unauthorized', 401)

    const role = req.user.role

    //console.log('RBAC CHECK: ', role, resource, action)

    // ✅ SAFE ENTERPRISE CAST
    const allowed = RBAC[resource][action] as readonly string[]

    if (!allowed.includes(role)) {
      throw new AppError('Forbidden', 403)
    }

    next()
  }
