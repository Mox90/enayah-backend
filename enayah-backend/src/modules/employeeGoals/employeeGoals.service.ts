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
    // ✅ ensure goals belong to appraisal
    const existing = await tx.query.employeeGoals.findMany({
      where: eq(employeeGoals.appraisalId, appraisalId),
    })

    if (!existing.length) {
      throw new AppError('No goals found', 404)
    }

    const ids = existing.map((g) => g.id)

    // ❗ prevent tampering
    const invalid = goals.some((g) => !ids.includes(g.id))
    if (invalid) {
      throw new AppError('Invalid goal ID provided', 400)
    }

    // ✅ update ratings
    for (const g of goals) {
      await tx
        .update(employeeGoals)
        .set({
          fulfillmentRating: g.fulfillmentRating,
        })
        .where(eq(employeeGoals.id, g.id))
    }

    return true
  })
}
