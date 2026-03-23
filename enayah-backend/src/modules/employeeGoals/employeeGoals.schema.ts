import { z } from 'zod'
import {
  validateNoRating,
  validateTotalWeight,
} from '../../utils/weightValidation'

/**
 * 🟣 GOAL ITEM (PLANNING - JANUARY)
 */
export const goalItemSchema = z.object({
  title: z.string().min(3),

  measurementStandard: z.string().optional().nullable(),

  relativeWeight: z.number().min(1).max(100),

  targetOutput: z.string().optional().nullable(),

  // ❗ MUST be null during planning
  fulfillmentRating: z.null().optional(),
})

/**
 * 🟣 PLANNING GOALS (JANUARY)
 */
export const planningGoalsSchema = z
  .object({
    appraisalId: z.string().uuid(),
    goals: z.array(goalItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    validateTotalWeight(data.goals, ctx, 'Goal')
    validateNoRating(data.goals, ctx)
  })

/**
 * 🟣 GOAL SCORING ITEM (DECEMBER)
 */
export const goalScoringItemSchema = z.object({
  id: z.uuid(),

  fulfillmentRating: z.number().int().min(1).max(5),
})

/**
 * 🟣 SCORING GOALS (DECEMBER)
 */
export const scoringGoalsSchema = z.object({
  appraisalId: z.uuid(),

  goals: z.array(goalScoringItemSchema).min(1),
})
