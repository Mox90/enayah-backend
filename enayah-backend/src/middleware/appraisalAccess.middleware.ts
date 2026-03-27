import { eq } from 'drizzle-orm'
import { Request, Response, NextFunction } from 'express'
import { db, employeeAppraisals } from '../db'
import { AppError } from '../utils/AppError'

export const authorizeAppraisalAccess = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const appraisalId = req.params.id
    if (!appraisalId) throw new AppError('Appraisal ID required', 400)
    const user = req.user!

    const appraisal = await db.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Not found', 404)

    const isOwner = appraisal.employeeId === user.employeeId
    const isManager = appraisal.appraiserId === user.employeeId
    const isHR = user.role === 'hr'

    if (!isOwner && !isManager && !isHR) {
      throw new AppError('Forbidden', 403)
    }

    next()
  }
}
