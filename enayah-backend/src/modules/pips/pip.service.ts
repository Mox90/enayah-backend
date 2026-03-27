import { performanceImprovementPlans } from '../../db'

export const createPIP = async (
  tx: any,
  {
    appraisalId,
    objectives,
    successCriteria,
    level,
    durationDays,
  }: {
    appraisalId: string
    objectives: string
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
      successCriteria,
      level,
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    })
    .returning()

  return pip
}
