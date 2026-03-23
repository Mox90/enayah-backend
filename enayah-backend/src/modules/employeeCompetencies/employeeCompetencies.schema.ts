import { z } from 'zod'
import {
  validateNoRating,
  validateTotalWeight,
} from '../../utils/weightValidation'

export const competencyItemSchema = z.object({
  competencyId: z.uuid(),

  relativeWeight: z.number().min(1).max(100),

  // ❗ must be null during planning
  fulfillmentRating: z.null().optional(),
})

export const planningCompetenciesSchema = z
  .object({
    appraisalId: z.uuid(),
    competencies: z.array(competencyItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    validateTotalWeight(data.competencies, ctx, 'Competency')
    validateNoRating(data.competencies, ctx)
  })
