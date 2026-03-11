import { Request, Response, NextFunction } from 'express'
import { FIELD_RBAC } from '../config/fieldRbac'
import { AppError } from '../utils/AppError'
import { filterFields } from '../utils/fieldFilter'

export const fieldRead = (resource: keyof typeof FIELD_RBAC) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as keyof (typeof FIELD_RBAC)[typeof resource]

    const config = FIELD_RBAC[resource]?.[role]
    if (!config) return next()

    const allowed = config.read

    const originalJson = res.json.bind(res)

    res.json = (body: any) => {
      // ⭐ CASE 1 — standard response wrapper
      if (body?.data) {
        body.data = filterFields(body.data, allowed)
      }

      // ⭐ CASE 2 — raw array/object (fallback)
      else {
        body = filterFields(body, allowed)
      }

      return originalJson(body)
    }

    next()
  }
}

export const fieldWrite =
  (resource: keyof typeof FIELD_RBAC) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role) return next()

    const config = FIELD_RBAC[resource]?.[role]
    if (!config) return next()

    if (config.write === '*') return next()

    const allowed = config.write as readonly string[]

    // ⭐ sanitize request body first
    const filteredBody: Record<string, unknown> = {}

    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) {
        filteredBody[key] = req.body[key]
      }
    }

    const forbidden = Object.keys(req.body).filter((k) => !allowed.includes(k))

    if (forbidden.length) {
      throw new AppError(`Not allowed to modify: ${forbidden.join(', ')}`, 403)
    }

    req.body = filteredBody

    next()
  }
