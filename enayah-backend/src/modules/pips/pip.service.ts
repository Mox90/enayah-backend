import { and, eq } from 'drizzle-orm'
import { db, performanceImprovementPlans, PipStatus } from '../../db'

export const createPIP = async (
  tx: any,
  {
    appraisalId,
    objectives,
    actionPlan,
    successCriteria,
    level,
    durationDays,
  }: {
    appraisalId: string
    objectives: string
    actionPlan: string
    successCriteria: string
    level: 'moderate' | 'critical'
    durationDays: number
  },
) => {
  const [pip] = await tx
    .insert(performanceImprovementPlans)
    .values({
      appraisalId,
      objectives,
      actionPlan,
      successCriteria,
      level,
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    })
    .returning()

  return pip
}

export const updatePIPProgress = async (
  appraisalId: string,
  {
    progress,
    managerComments,
    status,
  }: {
    progress?: number
    managerComments?: string
    status?: PipStatus
  },
) => {
  // 🔹 Get existing PIP
  const [pip] = await db
    .select()
    .from(performanceImprovementPlans)
    .where(
      and(
        eq(performanceImprovementPlans.appraisalId, appraisalId),
        eq(performanceImprovementPlans.isDeleted, false),
      ),
    )
    .limit(1)

  if (!pip) {
    throw new Error('PIP not found')
  }

  if (pip.status === 'completed' || pip.status === 'failed') {
    throw new Error('Cannot update a closed PIP')
  }

  if (
    progress === undefined &&
    managerComments === undefined &&
    status === undefined
  ) {
    throw new Error('No fields provided for update')
  }

  // 🔥 VALIDATIONS
  if (progress !== undefined && (progress < 0 || progress > 100)) {
    throw new Error('Progress must be between 0 and 100')
  }

  // 🔥 AUTO STATUS LOGIC
  let finalStatus: PipStatus = (pip.status as PipStatus) || 'active'

  if (status) {
    finalStatus = status
  }

  if (progress === 100) {
    finalStatus = 'completed'
  }

  // 🔥 AUTO CLOSE DATE
  const closedAt =
    finalStatus === 'completed' || finalStatus === 'failed' ? new Date() : null

  // 🔹 Update
  await db
    .update(performanceImprovementPlans)
    .set({
      ...(progress !== undefined && { progress }),
      ...(managerComments !== undefined && { managerComments }),
      status: finalStatus,
      closedAt,
      updatedAt: new Date(),
    })
    .where(eq(performanceImprovementPlans.appraisalId, appraisalId))

  return {
    message: 'PIP updated successfully',
    status: finalStatus,
    progress: progress ?? pip.progress,
  }
}

export const getPIPByAppraisal = async (appraisalId: string) => {
  const result = await db
    .select()
    .from(performanceImprovementPlans)
    .where(
      and(
        eq(performanceImprovementPlans.appraisalId, appraisalId),
        eq(performanceImprovementPlans.isDeleted, false),
      ),
    )

    .limit(1)

  return result[0] || null
}
