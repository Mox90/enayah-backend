import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './appraisal.service'
import { Request, Response } from 'express'

export const createCycleController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { year } = req.body
      const result = await service.createCycle(year)
      return successResponse(res, result, 'Cycle created')
    } catch (error) {
      console.error('CREATE CYCLE ERROR:', error) // ⭐ ADD THIS
      throw error
    }
  },
)
