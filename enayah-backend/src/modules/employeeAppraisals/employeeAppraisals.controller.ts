import { AppError } from '../../utils/AppError'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeAppraisals.service'
import * as appraisalService from '../appraisalCycles/appraisal.service'
import { Request, Response } from 'express'
import { appraisalRatingLabels } from '../../utils/appraisalRating'
import { eq } from 'drizzle-orm'
import { db, employeeAppraisals } from '../../db'
import { appraisalFeedbackSchema } from './employeeAppraisals.schema'

export const launchAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, cycleId } = req.body

    const appraiserId = req.user?.employeeId
    if (!appraiserId) {
      throw new AppError('Authenticated user must have an employee record', 403)
    }

    const result = await service.launchAppraisal(
      employeeId,
      appraiserId,
      cycleId,
    )

    return successResponse(res, result, 'Appraisal launched')
  },
)

export const submitAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const result = await service.submitAppraisal(id)

    const label = appraisalRatingLabels[result.overallRating]

    return successResponse(
      res,
      {
        ...result,
        overallRatingLabel: label,
      },
      'Appraisal submitted',
    )
  },
)

export const updateFeedbackController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = appraisalFeedbackSchema.parse(req.body)

    const { appraisalId, strengths, developmentAreas, comments } = data

    const payload: {
      strengths: string
      developmentAreas: string
      comments?: string
    } = {
      strengths,
      developmentAreas,
    }

    if (comments !== undefined) {
      payload.comments = comments
    }

    const result = await service.updateAppraisalFeedback(appraisalId, payload)

    return successResponse(res, result, 'Feedback updated')
  },
)
