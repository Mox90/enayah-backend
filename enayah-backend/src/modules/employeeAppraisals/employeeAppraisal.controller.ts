import { AppError } from '../../utils/AppError'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeAppraisal.service'
import { Request, Response } from 'express'

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
