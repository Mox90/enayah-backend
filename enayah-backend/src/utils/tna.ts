import { and, eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import {
  trainings,
  roleCompetencies,
  trainingAssignments,
  auditLogs,
} from '../db/schema'
import { matchTrainingsWithAI } from '../modules/ai/aiAppraisal.service'
import {
  getHorizonFromRating,
  getPriorityFromHorizon,
  getDueDate,
} from './tna.helpers'

// 🔹 Minimal local types (clean + avoids implicit any)
type AIResult = {
  trainingId: string
  reason: string
}

type RoleCompetency = {
  competencyId: string
}

type TrainingAssignmentRow = {
  trainingId: string
}

type Training = {
  id: string
  title: string
  competencyId: string
}

export const generateTNA = async (
  tx: any,
  appraisal: any,
  lowGoals: any[],
  lowCompetencies: any[],
) => {
  // 🟣 0️⃣ Early exit (IMPORTANT)
  if (!lowGoals.length && !lowCompetencies.length) {
    return []
  }

  // 🟣 1️⃣ Fetch trainings (exclude deleted)
  const allTrainings: Training[] = await tx.query.trainings.findMany({
    where: eq(trainings.isDeleted, false),
  })

  // 🟣 2️⃣ Role-based filtering (exclude deleted)
  const roleComps: RoleCompetency[] = await tx.query.roleCompetencies.findMany({
    where: and(
      eq(roleCompetencies.role, appraisal.jobTitleSnapshot),
      eq(roleCompetencies.isDeleted, false),
    ),
  })

  const allowedCompetencyIds = roleComps.map((r) => r.competencyId)

  const filteredTrainings =
    allowedCompetencyIds.length > 0
      ? allTrainings.filter((t) =>
          allowedCompetencyIds.includes(t.competencyId),
        )
      : allTrainings

  // 🟣 3️⃣ AI matching
  const aiResults: AIResult[] = await matchTrainingsWithAI({
    goals: lowGoals,
    competencies: lowCompetencies,
    trainings: filteredTrainings,
  })

  // 🟣 3.1️⃣ Deduplicate AI results (CRITICAL)
  const uniqueAIResults: AIResult[] = Array.from(
    new Map(aiResults.map((r) => [r.trainingId, r])).values(),
  )

  const trainingIds = uniqueAIResults.map((r) => r.trainingId)
  if (trainingIds.length === 0) return []

  // 🟣 4️⃣ Fetch existing assignments (exclude deleted)
  const existingAssignments: TrainingAssignmentRow[] =
    await tx.query.trainingAssignments.findMany({
      where: and(
        eq(trainingAssignments.employeeId, appraisal.employeeId),
        inArray(trainingAssignments.trainingId, trainingIds),
        eq(trainingAssignments.isDeleted, false),
      ),
    })

  const existingIds = new Set(existingAssignments.map((e) => e.trainingId))

  // 🟣 5️⃣ Compute horizon + priority
  const worstRating = Math.min(
    ...lowCompetencies.map((c) => Number(c.fulfillmentRating)),
    ...lowGoals.map((g) => Number(g.fulfillmentRating)),
  )

  const horizon = getHorizonFromRating(worstRating)
  const priority = getPriorityFromHorizon(horizon)

  // 🟣 6️⃣ Prepare batch inserts
  const assignmentValues: any[] = []
  const auditValues: any[] = []
  const assignedTitles: string[] = []

  // 🔥 Map trainings for O(1) lookup
  const trainingMap = new Map(filteredTrainings.map((t) => [t.id, t]))

  for (const result of uniqueAIResults) {
    if (existingIds.has(result.trainingId)) continue

    const training = trainingMap.get(result.trainingId)
    if (!training) continue

    const assignmentId = randomUUID()

    // 🟣 Assignment batch
    assignmentValues.push({
      id: assignmentId,
      employeeId: appraisal.employeeId,
      trainingId: training.id,
      horizon,
      priority,
      dueDate: getDueDate(horizon),
      aiReason: result.reason, // ✅ AI explainability
    })

    // 🟣 Audit batch (FIXED: correct recordId)
    auditValues.push({
      tableName: 'training_assignments',
      recordId: assignmentId, // ✅ correct
      fieldName: 'assignment',
      oldValue: null,
      newValue: {
        employeeId: appraisal.employeeId,
        trainingId: training.id,
        horizon,
        priority,
        aiReason: result.reason,
      },
      action: 'INSERT',
      performedBy: appraisal.appraiserId,
    })

    assignedTitles.push(training.title)
  }

  // 🟣 7️⃣ Batch insert (safe with unique index)
  if (assignmentValues.length > 0) {
    try {
      await tx.insert(trainingAssignments).values(assignmentValues)
    } catch (err: any) {
      if (err.code !== '23505') {
        throw err
      }
      // ✅ ignore duplicate race condition
    }
  }

  if (auditValues.length > 0) {
    await tx.insert(auditLogs).values(auditValues)
  }

  return assignedTitles
}
