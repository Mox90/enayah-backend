import { callAI } from './aiClient'
import { withRetry } from './aiRetry'
import { z } from 'zod'

const pipContentSchema = z.object({
  objectives: z.string(),
  successCriteria: z.string(),
})

export const generatePIPContent = async ({
  lowGoals,
  lowCompetencies,
}: {
  lowGoals: any[]
  lowCompetencies: any[]
}) => {
  const prompt = `
Generate a Performance Improvement Plan.

LOW GOALS:
${lowGoals.map((g) => g.title).join('\n')}

LOW COMPETENCIES:
${lowCompetencies.map((c) => c.competency?.name).join('\n')}

Return:
{
  "objectives": "...",
  "successCriteria": "..."
}
`

  try {
    const raw = await withRetry(() => callAI(prompt))
    const parsed = JSON.parse(raw)
    return pipContentSchema.parse(parsed)
  } catch {
    return {
      objectives: 'Improve performance in identified weak areas',
      successCriteria: 'Achieve rating ≥ 3 in next review',
    }
  }
}
