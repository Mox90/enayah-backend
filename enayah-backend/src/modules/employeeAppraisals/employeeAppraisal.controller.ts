import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeAppraisal.service'
import { Request, Response } from 'express'

export const launchAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, cycleId } = req.body

    const result = await service.launchAppraisal(
      employeeId,
      req.user!.employeeId!,
      cycleId,
    )

    return successResponse(res, result, 'Appraisal launched')
  },
)
