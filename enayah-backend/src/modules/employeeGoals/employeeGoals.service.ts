import { eq } from 'drizzle-orm'
import { db, employeeGoals } from '../../db'
import { AppError } from '../../utils/AppError'
import { z } from 'zod'
import { goalItemSchema, goalScoringItemSchema } from './employeeGoals.schema'

type GoalInput = z.infer<typeof goalItemSchema>
type GoalScoreInput = z.infer<typeof goalScoringItemSchema>

export const savePlanningGoals = async (
  appraisalId: string,
  goals: GoalInput[],
) => {
  if (!goals.length) {
    throw new AppError('At least one goal is required', 400)
  }

  if (goals.some((g) => g.title.trim().length < 3)) {
    throw new AppError(
      'Goal title must be at least 3 non-space characters',
      400,
    )
  }

  // ✅ 1. Validate total weight
  const totalWeight = goals.reduce(
    (sum, g) => sum + Number(g.relativeWeight),
    0,
  )

  if (totalWeight !== 100) {
    throw new AppError('Goal weight must equal 100%', 400)
  }

  // ✅ 2. Ensure no ratings yet
  if (goals.some((g) => g.fulfillmentRating != null)) {
    throw new AppError('Ratings not allowed yet', 400)
  }

  return db.transaction(async (tx) => {
    // ✅ 3. Clear existing goals
    await tx
      .delete(employeeGoals)
      .where(eq(employeeGoals.appraisalId, appraisalId))

    // ✅ 4. Insert SAFE mapped data
    const inserted = await tx.insert(employeeGoals).values(
      goals.map((g) => ({
        appraisalId,
        title: g.title.trim(),
        measurementStandard: g.measurementStandard ?? null,
        relativeWeight: String(g.relativeWeight), // numeric → string
        targetOutput: g.targetOutput ?? null,
        fulfillmentRating: null,
      })),
    )

    return inserted
  })
}

export const updateGoalRatings = async (
  appraisalId: string,
  goals: GoalScoreInput[],
) => {
  return db.transaction(async (tx) => {
    // ✅ fetch existing goals
    const existing = await tx.query.employeeGoals.findMany({
      where: eq(employeeGoals.appraisalId, appraisalId),
    })

    if (!existing.length) {
      throw new AppError('No goals found', 404)
    }

    const existingMap = new Map(existing.map((g) => [g.id, g]))

    // ❗ prevent tampering
    const invalid = goals.some((g) => !existingMap.has(g.id))
    if (invalid) {
      throw new AppError('Invalid goal ID provided', 400)
    }

    // ✅ update ratings + weighted score
    for (const g of goals) {
      const goal = existingMap.get(g.id)!

      const weight = Number(goal.relativeWeight) // numeric stored as string
      const rating = g.fulfillmentRating

      const weightedScore = rating * (weight / 100)

      await tx
        .update(employeeGoals)
        .set({
          fulfillmentRating: rating,
          weightedScore: String(weightedScore), // ⭐ IMPORTANT
        })
        .where(eq(employeeGoals.id, g.id))
    }

    return true
  })
}
