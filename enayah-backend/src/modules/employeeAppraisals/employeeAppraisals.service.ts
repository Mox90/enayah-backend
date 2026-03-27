import { eq, and } from 'drizzle-orm'
import {
  db,
  employees,
  employeeAppraisals,
  appraisalCycles,
  employeeCompetencies,
  employeeGoals,
  performanceImprovementPlans,
  users,
} from '../../db'
import { AppError } from '../../utils/AppError'
import { generateFeedback } from '../ai/aiAppraisal.service'
import { notify } from '../notifications/notification.service'
import { generateTNA } from '../../utils/tna'
import { enqueueTNAJob } from '../queue/tna.job'

const round = (num: number, decimals = 2) => Number(num.toFixed(decimals))

// 🟣 1. LAUNCH
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

  const cycle = await db.query.appraisalCycles.findFirst({
    where: eq(appraisalCycles.id, cycleId),
  })

  if (!cycle) throw new AppError('Cycle not found', 404)

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
      phase: 'planning',

      employeeNumberSnapshot: employee.employeeNumber,
      employeeNameSnapshot: `${employee.firstName} ${employee.familyName}`,
      employeeNameArSnapshot: `${employee.firstNameAr} ${employee.familyNameAr}`,
      jobTitleSnapshot: employee.position?.name ?? null,
      jobTitleArSnapshot: employee.position?.nameAr ?? null,
      departmentSnapshot: employee.department?.name ?? null,
      departmentArSnapshot: employee.department?.nameAr ?? null,
    })
    .returning()

  return appraisal
}

// 🟣 2. MANAGER SUBMIT PLANNING
export const submitPlanning = async (
  appraisalId: string,
  managerId: string,
) => {
  const appraisal = await db.query.employeeAppraisals.findFirst({
    where: eq(employeeAppraisals.id, appraisalId),
  })

  if (!appraisal) throw new AppError('Appraisal not found', 404)

  if (appraisal.appraiserId !== managerId) {
    throw new AppError('Not authorized', 403)
  }

  if (appraisal.status !== 'draft') {
    throw new AppError('Planning already submitted', 400)
  }

  await db
    .update(employeeAppraisals)
    .set({
      status: 'manager_review',
      planningSubmittedAt: new Date(),
      planningSubmittedBy: managerId,
      isRejected: false,
      rejectionReason: null,
    })
    .where(eq(employeeAppraisals.id, appraisalId))

  return true
}

// 🟣 3. MANAGER SUBMIT FINAL EVALUATION
export const submitAppraisal = async (
  appraisalId: string,
  managerId: string,
) => {
  let notificationPayload: {
    type: 'moderate' | 'critical' | null
    baseMessage?: string
    recipients?: string[]
  } = { type: null }

  const result = await db.transaction(async (tx) => {
    // 1️⃣ Get appraisal
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    // 🔐 Ensure appraiser exists
    if (!appraisal.appraiserId) {
      throw new AppError('Appraiser not assigned', 400)
    }

    // 🔐 Ensure only assigned appraiser can submit
    if (appraisal.appraiserId !== managerId) {
      throw new AppError('Not authorized', 403)
    }

    // ❗ must be planning completed
    if (appraisal.status !== 'submitted') {
      throw new AppError('Planning must be completed first', 400)
    }

    // ❗ STRICT: require feedback before submit
    if (
      !appraisal.strengths ||
      appraisal.strengths.trim().length < 10 ||
      !appraisal.developmentAreas ||
      appraisal.developmentAreas.trim().length < 10
    ) {
      throw new AppError(
        'Strengths and development areas are required before submission',
        400,
      )
    }

    // 2️⃣ Get goals
    const goals = await tx.query.employeeGoals.findMany({
      where: eq(employeeGoals.appraisalId, appraisalId),
    })

    if (!goals.length) throw new AppError('No goals found', 400)

    if (goals.some((g) => g.fulfillmentRating == null)) {
      throw new AppError('All goals must be rated before submission', 400)
    }

    // 3️⃣ Get competencies
    const competencies = await tx.query.employeeCompetencies.findMany({
      where: eq(employeeCompetencies.appraisalId, appraisalId),
      with: { competency: true },
    })

    if (!competencies.length) {
      throw new AppError('No competencies found', 400)
    }

    if (competencies.some((c) => c.fulfillmentRating == null)) {
      throw new AppError(
        'All competencies must be rated before submission',
        400,
      )
    }

    // 4️⃣ Compute scores
    const goalsScoreRaw = goals.reduce(
      (sum, g) => sum + Number(g.weightedScore ?? 0),
      0,
    )

    const competenciesScoreRaw = competencies.reduce(
      (sum, c) => sum + Number(c.weightedScore ?? 0),
      0,
    )

    // 5️⃣ Get cycle
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

    // 🟣 PIP LEVEL
    let pipLevel: 'moderate' | 'critical' = 'moderate'
    if (finalScore < 2.0) pipLevel = 'critical'

    // 7️⃣ Overall rating
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

    // 🟣 Identify low performance
    const lowGoals = goals.filter((g) => Number(g.fulfillmentRating) <= 2)
    const lowCompetencies = competencies.filter(
      (c) => Number(c.fulfillmentRating) <= 2,
    )

    const shouldCreatePIP =
      finalScore < 3.0 || lowGoals.length > 0 || lowCompetencies.length > 0

    let pipCreated = false

    // 🟣 8️⃣ Create PIP
    if (shouldCreatePIP) {
      const existingPIP = await tx.query.performanceImprovementPlans.findFirst({
        where: eq(performanceImprovementPlans.appraisalId, appraisalId),
      })

      if (!existingPIP) {
        const objectivesArray = generateSMARTObjectives(
          lowGoals,
          lowCompetencies,
        )

        const objectives = objectivesArray
          .map((o, i) => `${i + 1}. ${o}`)
          .join('\n')

        const successCriteria = generateSuccessCriteria()

        const durationDays = finalScore < 2 ? 120 : 90

        await tx.insert(performanceImprovementPlans).values({
          appraisalId,
          objectives,
          successCriteria,
          level: pipLevel,
          startDate: new Date(),
          endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        })

        pipCreated = true
      }
    }

    // 🟣 9️⃣ Generate TNA
    //await generateTNA(tx, appraisal, lowGoals, lowCompetencies)
    await enqueueTNAJob({
      appraisalId,
    })

    // 🟣 Prepare notification (DO NOT SEND YET)
    if (pipCreated) {
      const baseMessage = `
PIP has been created for employee.
Appraisal ID: ${appraisalId}
Final Score: ${finalScore}
Rating: ${overallRating}
`

      if (pipLevel === 'moderate') {
        notificationPayload = {
          type: 'moderate',
          baseMessage,
          recipients: [appraisal.appraiserId],
        }
      }

      if (pipLevel === 'critical') {
        const hrUsers = await tx.query.users.findMany({
          where: eq(users.role, 'hr'),
          columns: { employeeId: true },
        })

        const directorUsers = await tx.query.users.findMany({
          where: eq(users.role, 'director'),
          columns: { employeeId: true },
        })

        const isString = (val: string | null): val is string => val !== null

        const escalationRecipients = [
          ...hrUsers.map((u) => u.employeeId).filter(isString),
          ...directorUsers.map((u) => u.employeeId).filter(isString),
        ]

        const recipients = Array.from(
          new Set(
            [appraisal.appraiserId, ...escalationRecipients].filter(
              (id): id is string => Boolean(id),
            ),
          ),
        )

        notificationPayload = {
          type: 'critical',
          baseMessage,
          recipients,
        }
      }
    }

    // 🔟 Update appraisal
    await tx
      .update(employeeAppraisals)
      .set({
        phase: 'evaluation',
        status: 'manager_review',
        goalsScore: String(goalsScore),
        competenciesScore: String(competenciesScore),
        finalScore: String(finalScore),
        overallRating,
        finalSubmittedAt: new Date(),
        finalSubmittedBy: managerId,
        isRejected: false,
        rejectionReason: null,
      })
      .where(eq(employeeAppraisals.id, appraisalId))

    return {
      goalsScore,
      competenciesScore,
      finalScore,
      overallRating,
      pipCreated,
      pipLevel,
    }
  })

  // 🟢 🔔 SEND NOTIFICATION OUTSIDE TRANSACTION
  if (notificationPayload.type && notificationPayload.recipients) {
    await notify({
      title:
        notificationPayload.type === 'critical'
          ? '🚨 CRITICAL PERFORMANCE ALERT'
          : 'Performance Improvement Plan Created',
      message:
        notificationPayload.type === 'critical'
          ? notificationPayload.baseMessage + '\nImmediate attention required.'
          : notificationPayload.baseMessage!,
      recipients: notificationPayload.recipients,
    })
  }

  return result
}

// 🟣 4. EMPLOYEE ACKNOWLEDGE (PLANNING + FINAL)
export const acknowledgeAppraisal = async (
  appraisalId: string,
  employeeId: string,
) => {
  return db.transaction(async (tx) => {
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    if (appraisal.employeeId !== employeeId) {
      throw new AppError('Not authorized', 403)
    }

    // 🟢 PLANNING ACK
    if (appraisal.phase === 'planning') {
      if (appraisal.status !== 'manager_review') {
        throw new AppError('Planning not ready for acknowledgment', 400)
      }

      await tx
        .update(employeeAppraisals)
        .set({
          status: 'submitted',
          planningAcknowledgedAt: new Date(),
          planningAcknowledgedBy: employeeId,
        })
        .where(eq(employeeAppraisals.id, appraisalId))

      return { phase: 'planning' }
    }

    // 🔵 FINAL ACK
    if (appraisal.phase === 'evaluation') {
      if (appraisal.status !== 'manager_review') {
        throw new AppError('Final not ready for acknowledgment', 400)
      }

      await tx
        .update(employeeAppraisals)
        .set({
          status: 'hr_review',
          finalAcknowledgedAt: new Date(),
          finalAcknowledgedBy: employeeId,
        })
        .where(eq(employeeAppraisals.id, appraisalId))

      return { phase: 'evaluation' }
    }

    throw new AppError('Invalid phase', 400)
  })
}

// 🟣 5. HR APPROVAL
export const approveAppraisal = async (appraisalId: string, hrId: string) => {
  const appraisal = await db.query.employeeAppraisals.findFirst({
    where: eq(employeeAppraisals.id, appraisalId),
  })

  if (!appraisal) throw new AppError('Appraisal not found', 404)

  if (appraisal.status !== 'hr_review') {
    throw new AppError('Not ready for HR approval', 400)
  }

  await db
    .update(employeeAppraisals)
    .set({
      status: 'closed',
      hrApprovedAt: new Date(),
      hrApprovedBy: hrId,
    })
    .where(eq(employeeAppraisals.id, appraisalId))

  return true
}

// 🟣 6. REJECT (EMPLOYEE)
//Employee sees result → disagrees → rejects → manager edits → resubmits
export const rejectAppraisal = async (
  appraisalId: string,
  employeeId: string,
  reason: string,
) => {
  const appraisal = await db.query.employeeAppraisals.findFirst({
    where: eq(employeeAppraisals.id, appraisalId),
  })

  if (!appraisal) throw new AppError('Appraisal not found', 404)

  if (appraisal.employeeId !== employeeId) {
    throw new AppError('Not authorized', 403)
  }

  if (appraisal.status !== 'manager_review') {
    throw new AppError('Only review stage can be rejected', 400)
  }

  const newStatus = appraisal.phase === 'planning' ? 'draft' : 'submitted'

  await db
    .update(employeeAppraisals)
    .set({
      isRejected: true,
      rejectionReason: reason,
      status: newStatus, // 🔥 go back
    })
    .where(eq(employeeAppraisals.id, appraisalId))

  return true
}

// 🟣 7. REOPEN (MANAGER)
export const reopenAppraisal = async (
  appraisalId: string,
  managerId: string,
) => {
  const appraisal = await db.query.employeeAppraisals.findFirst({
    where: eq(employeeAppraisals.id, appraisalId),
  })

  if (!appraisal) throw new AppError('Appraisal not found', 404)

  if (appraisal.appraiserId !== managerId) {
    throw new AppError('Not authorized to reopen this appraisal', 403)
  }

  if (!appraisal.isRejected) {
    throw new AppError('Appraisal is not rejected', 400)
  }

  await db
    .update(employeeAppraisals)
    .set({
      status: appraisal.phase === 'planning' ? 'draft' : 'submitted',
      isRejected: false,
      rejectionReason: null,
    })
    .where(eq(employeeAppraisals.id, appraisalId))

  return true
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

  /*if (!appraisal.strengths || !appraisal.developmentAreas) {
    throw new AppError(
      'Feedback (strengths and development areas) is required before submission',
      400,
    )
  }*/
  if (!['draft', 'submitted'].includes(appraisal.status ?? '')) {
    throw new AppError(
      'Feedback can only be updated before final submission',
      400,
    )
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

export const generateAppraisalFeedback = async (appraisalId: string) => {
  const goals = await db.query.employeeGoals.findMany({
    where: eq(employeeGoals.appraisalId, appraisalId),
  })

  const competencies = await db.query.employeeCompetencies.findMany({
    where: eq(employeeCompetencies.appraisalId, appraisalId),
  })

  const feedback = generateFeedback({ goals, competencies })

  return feedback
}
