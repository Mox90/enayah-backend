import { eq } from 'drizzle-orm'
import { db, employeeGoals } from '../../db'
import { AppError } from '../../utils/AppError'

export const savePlanningGoals = async (appraisalId: string, goals: any[]) => {
  const totalWeight = goals.reduce(
    (sum, g) => sum + Number(g.relativeWeight),
    0,
  )

  if (totalWeight !== 100) {
    throw new AppError('Goal weight must equal 100%', 400)
  }

  if (goals.some((g) => g.fulfillmentRating != null)) {
    throw new AppError('Ratings not allowed yet', 400)
  }

  return db.transaction(async (tx) => {
    await tx
      .delete(employeeGoals)
      .where(eq(employeeGoals.appraisalId, appraisalId))

    return tx.insert(employeeGoals).values(
      goals.map((g) => ({
        appraisalId,
        ...g,
        fulfillmentRating: null,
      })),
    )
  })
}
