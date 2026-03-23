import { eq } from 'drizzle-orm'
import {
  db,
  appraisalCycles,
  employeeAppraisals,
  employeeGoals,
  employeeCompetencies,
} from '../../db'
import { AppError } from '../../utils/AppError'

/**
 * 🟣 CREATE APPRAISAL CYCLE
 */
export const createCycle = async (year: number) => {
  const exists = await db.query.appraisalCycles.findFirst({
    where: eq(appraisalCycles.year, year),
  })

  if (exists) throw new AppError('Cycle already exists', 409)

  const [cycle] = await db
    .insert(appraisalCycles)
    .values({
      year,
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-12-31`),
    })
    .returning()

  return cycle
}

/**
 * 🟣 SUBMIT SCORING (DECEMBER)
 */
export const submitScoring = async (appraisalId: string) => {
  return db.transaction(async (tx) => {
    // ✅ 1. Get appraisal
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    // 🛑 prevent double submission
    if (appraisal.status === 'submitted') {
      throw new AppError('Appraisal already submitted', 400)
    }
    //if (appraisal.status !== 'draft') {
    //  throw new AppError('Appraisal cannot be modified in current status', 400)
    //}

    // ✅ 2. Get goals
    const goals = await tx.query.employeeGoals.findMany({
      where: eq(employeeGoals.appraisalId, appraisalId),
    })

    if (!goals.length) {
      throw new AppError('No goals found', 400)
    }

    // ✅ 3. Get competencies (Design B)
    const competencies = await tx.query.employeeCompetencies.findMany({
      where: eq(employeeCompetencies.appraisalId, appraisalId),
    })

    if (!competencies.length) {
      throw new AppError('No competencies found', 400)
    }

    // ❗ Validate all ratings present
    if (goals.some((g) => g.fulfillmentRating == null)) {
      throw new AppError('All goals must be rated', 400)
    }

    if (competencies.some((c) => c.fulfillmentRating == null)) {
      throw new AppError('All competencies must be rated', 400)
    }

    // ✅ 4. Compute goals score
    const goalsScore = goals.reduce((sum, g) => {
      const rating = Number(g.fulfillmentRating)
      const weight = Number(g.relativeWeight)
      const weighted = rating * (weight / 100)

      return sum + weighted
    }, 0)

    // ✅ 5. Compute competencies score
    const competenciesScore = competencies.reduce((sum, c) => {
      const rating = Number(c.fulfillmentRating)
      const weight = Number(c.relativeWeight)
      const weighted = rating * (weight / 100)

      return sum + weighted
    }, 0)

    // ✅ 6. Get cycle weights
    const cycle = await tx.query.appraisalCycles.findFirst({
      where: eq(appraisalCycles.id, appraisal.cycleId),
    })

    if (!cycle) throw new AppError('Cycle not found', 404)

    const goalsWeight = Number(cycle.goalsWeight ?? 50)
    const competenciesWeight = Number(cycle.competenciesWeight ?? 50)

    // ✅ 7. Compute final score
    const finalScore =
      goalsScore * (goalsWeight / 100) +
      competenciesScore * (competenciesWeight / 100)

    // ✅ 8. Update weighted scores (optional but recommended)
    for (const g of goals) {
      await tx
        .update(employeeGoals)
        .set({
          weightedScore: (
            Number(g.fulfillmentRating) *
            (Number(g.relativeWeight) / 100)
          ).toString(),
        })
        .where(eq(employeeGoals.id, g.id))
    }

    for (const c of competencies) {
      await tx
        .update(employeeCompetencies)
        .set({
          weightedScore: (
            Number(c.fulfillmentRating) *
            (Number(c.relativeWeight) / 100)
          ).toString(),
        })
        .where(eq(employeeCompetencies.id, c.id))
    }

    // ✅ 9. Update appraisal
    await tx
      .update(employeeAppraisals)
      .set({
        goalsScore: goalsScore.toString(),
        competenciesScore: competenciesScore.toString(),
        finalScore: finalScore.toString(),
        status: 'submitted',
      })
      .where(eq(employeeAppraisals.id, appraisalId))

    // ✅ 10. Return result
    return {
      goalsScore,
      competenciesScore,
      finalScore,
    }
  })
}
