import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './appraisalApproval.service'
import { AppError } from '../../utils/AppError'

export const submitController = asyncHandler(
  async (req: Request, res: Response) => {
    const rawId = req.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId

    if (!id) {
      throw new AppError('Appraisal ID is required', 400)
    }

    const result = await service.submitAppraisal(id, req.user!.id)

    return successResponse(res, result, 'Appraisal submitted')
  },
)

export const acknowledgeController = asyncHandler(
  async (req: Request, res: Response) => {
    const rawId = req.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId

    if (!id) {
      throw new AppError('Appraisal ID is required', 400)
    }

    const result = await service.acknowledgeAppraisal(id, req.user!.id)

    return successResponse(res, result, 'Appraisal acknowledged')
  },
)

export const approveController = asyncHandler(
  async (req: Request, res: Response) => {
    const rawId = req.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId

    if (!id) {
      throw new AppError('Appraisal ID is required', 400)
    }

    const result = await service.approveAppraisal(id, req.user!.id)

    return successResponse(res, result, 'Appraisal approved')
  },
)
