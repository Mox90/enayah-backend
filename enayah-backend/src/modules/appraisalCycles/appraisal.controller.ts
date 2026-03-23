import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './appraisal.service'

export const createCycleController = asyncHandler(async (req, res) => {
  const { year } = req.body
  const result = await service.createCycle(year)
  return successResponse(res, result, 'Cycle created')
})
