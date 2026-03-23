import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeGoals.service'
import { planningGoalsSchema, scoringGoalsSchema } from './employeeGoals.schema'

/**
 * 🟣 SAVE PLANNING GOALS (JANUARY)
 * - Validates input via Zod
 * - Ensures total weight = 100%
 * - Ensures no ratings yet
 */
export const savePlanningGoalsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = planningGoalsSchema.parse(req.body)

    const result = await service.savePlanningGoals(data.appraisalId, data.goals)

    return successResponse(res, result, 'Goals saved successfully')
  },
)

export const updateGoalRatingsController = asyncHandler(async (req, res) => {
  const data = scoringGoalsSchema.parse(req.body)

  const result = await service.updateGoalRatings(data.appraisalId, data.goals)

  return successResponse(res, result, 'Goal ratings updated')
})
