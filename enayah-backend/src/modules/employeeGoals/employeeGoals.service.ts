import { eq } from 'drizzle-orm'
import { db, employeeGoals } from '../../db'
import { AppError } from '../../utils/AppError'
import { z } from 'zod'
import { goalItemSchema } from './employeeGoals.schema'

type GoalInput = z.infer<typeof goalItemSchema>

export const savePlanningGoals = async (
  appraisalId: string,
  goals: GoalInput[],
) => {
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
        title: g.title,
        measurementStandard: g.measurementStandard ?? null,
        relativeWeight: String(g.relativeWeight), // numeric → string
        targetOutput: g.targetOutput ?? null,
        fulfillmentRating: null,
      })),
    )

    return inserted
  })
}
