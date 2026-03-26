import { Request, Response, NextFunction } from 'express'
import { db, employeeAppraisals } from '../db'
import { eq } from 'drizzle-orm'
import { AppError } from '../utils/AppError'

type PhaseRule = {
  allowedRoles: string[]
  allowedStatuses: string[]
}

const rules: Record<string, PhaseRule> = {
  submitPlanning: {
    allowedRoles: ['manager'],
    allowedStatuses: ['draft'],
  },
  acknowledgePlanning: {
    allowedRoles: ['employee'],
    allowedStatuses: ['manager_review'],
  },
  submitEvaluation: {
    allowedRoles: ['manager'],
    allowedStatuses: ['submitted'],
  },
  acknowledgeEvaluation: {
    allowedRoles: ['employee'],
    allowedStatuses: ['manager_review'],
  },
  approveHR: {
    allowedRoles: ['hr'],
    allowedStatuses: ['hr_review'],
  },
}

export const enforceAppraisalPhase = (action: keyof typeof rules) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const appraisalId = req.params.id || req.body.appraisalId

    if (!appraisalId) {
      throw new AppError('Appraisal ID required', 400)
    }

    let rule: PhaseRule | undefined

    const appraisal = await db.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    if (action === 'acknowledge') {
      if (appraisal.phase === 'planning') {
        rule = rules['acknowledgePlanning']
      } else if (appraisal.phase === 'evaluation') {
        rule = rules['acknowledgeEvaluation']
      }
    } else {
      rule = rules[action]
    }

    if (!rule) {
      throw new AppError('Invalid action configuration', 500)
    }

    const role = req.user?.role
    if (!role || !rule.allowedRoles.includes(role)) {
      throw new AppError('Not authorized for this action', 403)
    }

    if (!appraisal.status) {
      throw new AppError('Appraisal status is invalid', 400)
    }

    if (!rule.allowedStatuses.includes(appraisal.status)) {
      throw new AppError(
        `Invalid stage. Current status: ${appraisal.status}`,
        400,
      )
    }

    next()
  }
}
