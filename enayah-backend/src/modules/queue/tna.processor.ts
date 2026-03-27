import { Job } from 'bullmq'
import { db } from '../../db'
import { generateTNA } from '../../utils/tna'
import { eq } from 'drizzle-orm'
import {
  employeeAppraisals,
  employeeCompetencies,
  employeeGoals,
} from '../../db/schema'

export const tnaProcessor = async (job: Job) => {
  const { appraisalId } = job.data

  return db.transaction(async (tx) => {
    // 🟣 1️⃣ Get appraisal
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new Error('Appraisal not found')

    // 🟣 2️⃣ Get low goals
    const goals = await tx.query.employeeGoals.findMany({
      where: eq(employeeGoals.appraisalId, appraisalId),
    })

    const lowGoals = goals.filter((g) => Number(g.fulfillmentRating) <= 2)

    // 🟣 3️⃣ Get low competencies
    const competencies = await tx.query.employeeCompetencies.findMany({
      where: eq(employeeCompetencies.appraisalId, appraisalId),
      with: { competency: true },
    })

    const lowCompetencies = competencies.filter(
      (c) => Number(c.fulfillmentRating) <= 2,
    )

    // 🟣 4️⃣ Generate TNA
    const assigned = await generateTNA(tx, appraisal, lowGoals, lowCompetencies)

    return assigned
  })
}
