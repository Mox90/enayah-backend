import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeCompetencies.service'
import { planningCompetenciesSchema } from './employeeCompetencies.schema'
import z from 'zod'

const scoringCompetenciesSchema = z.object({
  appraisalId: z.uuid(),
  competencies: z.array(
    z.object({
      id: z.uuid(),
      fulfillmentRating: z.number().int().min(1).max(5),
    }),
  ),
})

export const savePlanningCompetenciesController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = planningCompetenciesSchema.parse(req.body)

    const result = await service.savePlanningCompetencies(
      data.appraisalId,
      data.competencies,
    )

    return successResponse(res, result, 'Competencies saved')
  },
)

export const updateCompetencyRatingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = scoringCompetenciesSchema.parse(req.body)

    const result = await service.updateCompetencyRatings(
      data.appraisalId,
      data.competencies,
    )

    return successResponse(res, result, 'Competency ratings updated')
  },
)
