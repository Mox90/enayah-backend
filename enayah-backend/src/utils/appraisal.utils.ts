import { eq } from 'drizzle-orm'
import { db, employeeCompetencies, employeeGoals } from '../db'

export const computeGoalsScore = (goals: any[]) => {
  return goals.reduce((sum, g) => sum + Number(g.weightedScore || 0), 0)
}

export const computeCompetenciesScore = (competencies: any[]) => {
  return competencies.reduce((sum, c) => sum + Number(c.weightedScore || 0), 0)
}

export const getGoalsByAppraisalId = async (appraisalId: string) => {
  return await db
    .select()
    .from(employeeGoals)
    .where(eq(employeeGoals.appraisalId, appraisalId))
}

export const getCompetenciesByAppraisalId = async (appraisalId: string) => {
  return await db
    .select()
    .from(employeeCompetencies)
    .where(eq(employeeCompetencies.appraisalId, appraisalId))
}

/*export const predictRisk = ({ goals, competencies }: any) => {
  const lowGoals = goals.filter((g: any) => g.fulfillmentRating <= 2).length
  const lowCompetencies = competencies.filter(
    (c: any) => c.fulfillmentRating <= 2,
  ).length

  // 🔥 HIGH risk (more realistic)
  if (lowGoals >= 2 || lowCompetencies >= 2) {
    return { riskLevel: 'high' }
  }

  // ⚠️ MEDIUM
  if (lowGoals >= 1 || lowCompetencies >= 1) {
    return { riskLevel: 'medium' }
  }

  return { riskLevel: 'low' }
}*/
