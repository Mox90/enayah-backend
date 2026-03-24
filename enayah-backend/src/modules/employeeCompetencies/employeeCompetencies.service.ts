import { eq } from 'drizzle-orm'
import { db, employeeCompetencies } from '../../db'
import { AppError } from '../../utils/AppError'
import { z } from 'zod'
import { competencyItemSchema } from './employeeCompetencies.schema'

const competencyScoringItemSchema = z.object({
  id: z.uuid(),
  fulfillmentRating: z.number().int().min(1).max(5),
})

type CompetencyInput = z.infer<typeof competencyItemSchema>
type CompetencyScoreInput = z.infer<typeof competencyScoringItemSchema>

export const savePlanningCompetencies = async (
  appraisalId: string,
  competencies: CompetencyInput[],
) => {
  // ✅ 1. basic check
  if (!competencies.length) {
    throw new AppError('At least one competency is required', 400)
  }

  // ✅ 2. validate total weight
  const totalWeight = competencies.reduce(
    (sum, c) => sum + Number(c.relativeWeight),
    0,
  )

  if (totalWeight !== 100) {
    throw new AppError('Competency weight must equal 100%', 400)
  }

  // ✅ 3. ensure no rating yet
  if (competencies.some((c) => c.fulfillmentRating != null)) {
    throw new AppError('Ratings not allowed yet', 400)
  }

  return db.transaction(async (tx) => {
    // ✅ 4. clear existing competencies
    await tx
      .delete(employeeCompetencies)
      .where(eq(employeeCompetencies.appraisalId, appraisalId))

    // ✅ 5. insert SAFE mapped data
    const inserted = await tx.insert(employeeCompetencies).values(
      competencies.map((c) => ({
        appraisalId,
        competencyId: c.competencyId,
        relativeWeight: String(c.relativeWeight), // numeric → string
        fulfillmentRating: null,
      })),
    )

    return inserted
  })
}

export const updateCompetencyRatings = async (
  appraisalId: string,
  competencies: CompetencyScoreInput[],
) => {
  return db.transaction(async (tx) => {
    // ✅ fetch existing competencies
    const existing = await tx.query.employeeCompetencies.findMany({
      where: eq(employeeCompetencies.appraisalId, appraisalId),
    })

    if (!existing.length) {
      throw new AppError('No competencies found', 404)
    }

    // ✅ map for fast lookup
    const existingMap = new Map(existing.map((c) => [c.id, c]))

    // ❗ prevent tampering
    const invalid = competencies.some((c) => !existingMap.has(c.id))
    if (invalid) {
      throw new AppError('Invalid competency ID provided', 400)
    }

    // ✅ update ratings + weighted score
    for (const c of competencies) {
      const comp = existingMap.get(c.id)!

      const weight = Number(comp.relativeWeight) // stored as string
      const rating = c.fulfillmentRating

      const weightedScore = rating * (weight / 100)

      await tx
        .update(employeeCompetencies)
        .set({
          fulfillmentRating: rating,
          weightedScore: String(weightedScore), // ⭐ IMPORTANT
        })
        .where(eq(employeeCompetencies.id, c.id))
    }

    return true
  })
}
