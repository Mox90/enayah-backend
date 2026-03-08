import { Request, Response, NextFunction } from 'express'
import { FIELD_RBAC } from '../config/fieldRbac'
import { AppError } from '../utils/AppError'
import { filterFields } from '../utils/fieldFilter'

export const fieldRead =
  (resource: keyof typeof FIELD_RBAC) =>
  (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json

    res.json = function (data) {
      const role = req.user?.role
      if (!role) return originalJson.call(this, data)

      const config = FIELD_RBAC[resource][role]
      if (!config) return originalJson.call(this, data)

      return originalJson.call(this, filterFields(data, config.read))
    }

    next()
  }

export const fieldWrite =
  (resource: keyof typeof FIELD_RBAC) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role) return next()

    const config = FIELD_RBAC[resource][role]
    if (!config) return next()

    if (config.write === '*') return next()

    const keys = Object.keys(req.body)

    const forbidden = keys.filter((k) => !config.write.includes(k))

    if (forbidden.length) {
      throw new AppError(`Not allowed to modify: ${forbidden.join(', ')}`, 403)
    }

    next()
  }
