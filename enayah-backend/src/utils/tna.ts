import { eq, and, InferSelectModel, inArray } from 'drizzle-orm'
import {
  trainings,
  trainingAssignments,
  roleCompetencies,
  auditLogs,
} from '../db'
import { matchTrainingsWithAI } from '../modules/ai/aiAppraisal.service'
import {
  getHorizonFromRating,
  getPriorityFromHorizon,
  getDueDate,
} from './tna.helpers'
import { logFieldChange } from '../modules/audit/audit.service'

type Training = InferSelectModel<typeof trainings>
type RoleCompetency = InferSelectModel<typeof roleCompetencies>

export const isString = (val: string | null): val is string => val !== null

export const generateTNA = async (
  tx: any,
  appraisal: any,
  lowGoals: any[],
  lowCompetencies: any[],
) => {
  // 🟣 1️⃣ Fetch trainings
  const allTrainings: Training[] = await tx.query.trainings.findMany()

  // 🟣 2️⃣ Role-based filtering
  const roleComps: RoleCompetency[] = await tx.query.roleCompetencies.findMany({
    where: eq(roleCompetencies.role, appraisal.jobTitleSnapshot),
  })

  const allowedCompetencyIds = roleComps.map((r) => r.competencyId)

  const filteredTrainings =
    allowedCompetencyIds.length > 0
      ? allTrainings.filter((t) =>
          allowedCompetencyIds.includes(t.competencyId),
        )
      : allTrainings

  // 🟣 3️⃣ AI matching
  const aiResults = await matchTrainingsWithAI({
    goals: lowGoals,
    competencies: lowCompetencies,
    trainings: filteredTrainings,
  })

  const trainingIds = aiResults.map((r) => r.trainingId)

  if (trainingIds.length === 0) return []

  // 🟣 4️⃣ Fetch existing assignments (ONE QUERY)
  const existingAssignments = await tx.query.trainingAssignments.findMany({
    where: and(
      eq(trainingAssignments.employeeId, appraisal.employeeId),
      inArray(trainingAssignments.trainingId, trainingIds),
    ),
  })

  const existingIds = new Set(existingAssignments.map((e) => e.trainingId))

  // 🟣 5️⃣ Prepare batch inserts
  const worstRating = Math.min(
    ...lowCompetencies.map((c) => Number(c.fulfillmentRating)),
    ...lowGoals.map((g) => Number(g.fulfillmentRating)),
  )

  const horizon = getHorizonFromRating(worstRating)
  const priority = getPriorityFromHorizon(horizon)

  const assignmentValues: any[] = []
  const auditValues: any[] = []
  const assignedTitles: string[] = []

  // 🔥 Map trainings for fast lookup
  const trainingMap = new Map(filteredTrainings.map((t) => [t.id, t]))

  for (const result of aiResults) {
    if (existingIds.has(result.trainingId)) continue

    const training = trainingMap.get(result.trainingId)
    if (!training) continue

    // 🟣 Assignment batch
    assignmentValues.push({
      employeeId: appraisal.employeeId,
      trainingId: training.id,
      horizon,
      priority,
      dueDate: getDueDate(horizon),
    })

    // 🟣 Audit batch
    auditValues.push({
      tableName: 'training_assignments',
      recordId: training.id,
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

  // 🟣 6️⃣ Batch insert (VERY IMPORTANT)
  if (assignmentValues.length > 0) {
    await tx.insert(trainingAssignments).values(assignmentValues)
  }

  if (auditValues.length > 0) {
    await tx.insert(auditLogs).values(auditValues)
  }

  return assignedTitles
}
