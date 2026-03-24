import { eq, and } from 'drizzle-orm'
import {
  db,
  employees,
  employeeAppraisals,
  appraisalCycles,
  employeeCompetencies,
  employeeGoals,
} from '../../db'
import { AppError } from '../../utils/AppError'

const round = (num: number, decimals = 2) => Number(num.toFixed(decimals))

export const launchAppraisal = async (
  employeeId: string,
  appraiserId: string,
  cycleId: string,
) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId),
    with: {
      position: true,
      department: true,
    },
  })

  if (!employee) throw new AppError('Employee not found', 404)

  const exists = await db.query.employeeAppraisals.findFirst({
    where: and(
      eq(employeeAppraisals.employeeId, employeeId),
      eq(employeeAppraisals.cycleId, cycleId),
    ),
  })

  if (exists) throw new AppError('Already launched', 409)

  const [appraisal] = await db
    .insert(employeeAppraisals)
    .values({
      employeeId,
      appraiserId,
      cycleId,
      status: 'draft',

      employeeNumberSnapshot: employee.employeeNumber,
      employeeNameSnapshot: `${employee.firstName} ${employee.familyName}`,
      employeeNameArSnapshot: `${employee.firstNameAr} ${employee.familyNameAr}`,
      //      jobTitleSnapshot: employee.positionId,
      jobTitleSnapshot: employee.position?.name ?? null,
      jobTitleArSnapshot: employee.position?.nameAr ?? null,
      departmentSnapshot: employee.department?.name ?? null,
      departmentArSnapshot: employee.department?.nameAr ?? null,
    })
    .returning()

  return appraisal
}

export const submitAppraisal = async (appraisalId: string) => {
  return db.transaction(async (tx) => {
    // 1️⃣ Get appraisal
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    // 2️⃣ Get goals
    const goals = await tx.query.employeeGoals.findMany({
      where: eq(employeeGoals.appraisalId, appraisalId),
    })

    if (!goals.length) throw new AppError('No goals found', 400)

    // ❗ Ensure all rated
    if (goals.some((g) => g.fulfillmentRating == null)) {
      throw new AppError('All goals must be rated before submission', 400)
    }

    // 3️⃣ Get competencies
    const competencies = await tx.query.employeeCompetencies.findMany({
      where: eq(employeeCompetencies.appraisalId, appraisalId),
    })

    if (!competencies.length) throw new AppError('No competencies found', 400)

    if (competencies.some((c) => c.fulfillmentRating == null)) {
      throw new AppError(
        'All competencies must be rated before submission',
        400,
      )
    }

    // 4️⃣ Compute scores (sum weightedScore)
    const goalsScoreRaw = goals.reduce(
      (sum, g) => sum + Number(g.weightedScore ?? 0),
      0,
    )

    const competenciesScoreRaw = competencies.reduce(
      (sum, c) => sum + Number(c.weightedScore ?? 0),
      0,
    )

    // 5️⃣ Get cycle weights
    const cycle = await tx.query.appraisalCycles.findFirst({
      where: eq(appraisalCycles.id, appraisal.cycleId),
    })

    if (!cycle) throw new AppError('Cycle not found', 404)

    const goalsWeight = Number(cycle.goalsWeight) / 100
    const competenciesWeight = Number(cycle.competenciesWeight) / 100

    // 6️⃣ Final score
    const finalScoreRaw =
      goalsScoreRaw * goalsWeight + competenciesScoreRaw * competenciesWeight

    const goalsScore = round(goalsScoreRaw)
    const competenciesScore = round(competenciesScoreRaw)
    const finalScore = round(finalScoreRaw)

    // 7️⃣ Overall Rating (🔥 VERY IMPORTANT)
    let overallRating:
      | 'outstanding'
      | 'exceeds'
      | 'meets'
      | 'needs_improvement'
      | 'unsatisfactory' = 'needs_improvement'

    if (finalScore >= 4.5) overallRating = 'outstanding'
    else if (finalScore >= 4.0) overallRating = 'exceeds'
    else if (finalScore >= 3.0) overallRating = 'meets'
    else if (finalScore >= 2.0) overallRating = 'needs_improvement'
    else overallRating = 'unsatisfactory'

    // 8️⃣ Update appraisal
    await tx
      .update(employeeAppraisals)
      .set({
        goalsScore: String(goalsScore),
        competenciesScore: String(competenciesScore),
        finalScore: String(finalScore),
        overallRating,
        status: 'submitted',
      })
      .where(eq(employeeAppraisals.id, appraisalId))

    return {
      goalsScore,
      competenciesScore,
      finalScore,
      overallRating,
    }
  })
}

export const updateAppraisalFeedback = async (
  appraisalId: string,
  data: {
    strengths: string
    developmentAreas: string
    comments?: string
  },
) => {
  const appraisal = await db.query.employeeAppraisals.findFirst({
    where: eq(employeeAppraisals.id, appraisalId),
  })

  if (!appraisal) throw new AppError('Appraisal not found', 404)

  // ❗ prevent editing after submit
  if (appraisal.status !== 'draft') {
    throw new AppError('Cannot update after submission', 400)
  }

  await db
    .update(employeeAppraisals)
    .set({
      strengths: data.strengths,
      developmentAreas: data.developmentAreas,
      comments: data.comments ?? null,
    })
    .where(eq(employeeAppraisals.id, appraisalId))

  return true
}
