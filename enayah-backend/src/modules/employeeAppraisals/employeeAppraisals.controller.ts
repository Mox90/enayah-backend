import { AppError } from '../../utils/AppError'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeAppraisals.service'
import * as appraisalService from '../appraisalCycles/appraisal.service'
import { Request, Response } from 'express'
import { appraisalRatingLabels } from '../../utils/appraisalRating'
import { eq } from 'drizzle-orm'
import { db, employeeAppraisals } from '../../db'
import {
  appraisalFeedbackSchema,
  launchAppraisalSchema,
} from './employeeAppraisals.schema'
import { requireManager, requireHR, requireEmployee } from '../../utils/auth'

export const launchAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, cycleId } = launchAppraisalSchema.parse(req.body)

    const appraiserId = requireManager(req)

    const result = await service.launchAppraisal(
      employeeId,
      appraiserId,
      cycleId,
    )

    return successResponse(res, result, 'Appraisal launched')
  },
)

export const submitPlanningController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const managerId = requireManager(req)

    const result = await service.submitPlanning(id, managerId)

    return successResponse(res, result, 'Planning submitted')
  },
)

export const acknowledgeAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const employeeId = requireEmployee(req)

    const result = await service.acknowledgeAppraisal(id, employeeId)

    return successResponse(res, result, 'Appraisal acknowledged')
  },
)

export const submitAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const managerId = requireManager(req)

    const result = await service.submitAppraisal(id, managerId)

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

export const approveAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const hrId = requireHR(req)

    const result = await service.approveAppraisal(id, hrId)

    return successResponse(res, result, 'Appraisal approved by HR')
  },
)

export const rejectAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const employeeId = requireEmployee(req)

    const { reason } = req.body

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', 400)
    }

    const result = await service.rejectAppraisal(id, employeeId!, reason.trim())

    return successResponse(res, result, 'Appraisal rejected')
  },
)

export const reopenAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const managerId = requireManager(req)

    const result = await service.reopenAppraisal(id, managerId!)

    return successResponse(res, result, 'Appraisal reopened')
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
