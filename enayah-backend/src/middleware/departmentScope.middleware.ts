import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

export const departmentScope = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) throw new AppError('Unauthorized', 401)

  if (req.user.role !== 'manager' && req.user.role !== 'director') return next()

  req.query.departmentId = req.user.departmentId as string

  next()
}
