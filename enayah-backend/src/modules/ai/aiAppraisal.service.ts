type Goal = {
  title: string
  fulfillmentRating: number | null
}

type Competency = {
  competencyId: string
  fulfillmentRating: number | null
}

export const generateFeedback = (data: {
  goals: Goal[]
  competencies: Competency[]
}) => {
  const strengths: string[] = []
  const development: string[] = []

  // 🔹 Goals analysis
  for (const g of data.goals) {
    if (!g.fulfillmentRating) continue

    if (g.fulfillmentRating >= 4) {
      strengths.push(g.title)
    } else if (g.fulfillmentRating <= 2) {
      development.push(g.title)
    }
  }

  // 🔹 Competencies analysis (basic for now)
  for (const c of data.competencies) {
    if (!c.fulfillmentRating) continue

    if (c.fulfillmentRating <= 2) {
      development.push(`Improve competency: ${c.competencyId}`)
    }
  }

  return {
    strengths:
      strengths.length > 0
        ? `Demonstrates strong performance in: ${strengths.join(', ')}.`
        : 'No major strengths identified.',

    developmentAreas:
      development.length > 0
        ? `Needs improvement in: ${development.join(', ')}.`
        : 'No critical development areas.',
  }
}

export const generateAIInsights = async (data: {
  goals: any[]
  competencies: any[]
}) => {
  const lowGoals = data.goals.filter(
    (g) => g.fulfillmentRating != null && g.fulfillmentRating <= 2,
  )
  const highGoals = data.goals.filter(
    (g) => g.fulfillmentRating != null && g.fulfillmentRating >= 4,
  )

  const lowCompetencies = data.competencies.filter(
    (c) => c.fulfillmentRating != null && c.fulfillmentRating <= 2,
  )
  const highCompetencies = data.competencies.filter(
    (c) => c.fulfillmentRating != null && c.fulfillmentRating >= 4,
  )

  return {
    strengths: highGoals.map((g) => g.title),
    developmentAreas: lowGoals.map((g) => g.title),
    trainingNeeds: lowCompetencies.map((c) => c.competencyId),
    needsPIP: lowGoals.length > 0 || lowCompetencies.length > 0,
  }
}

export const matchTrainingsWithAI = async ({
  goals,
  competencies,
  trainings,
}: {
  goals: any[]
  competencies: any[]
  trainings: any[]
}) => {
  const prompt = `
You are an HR expert.

LOW GOALS:
${goals.map((g) => `${g.title} (${g.fulfillmentRating})`).join('\n')}

LOW COMPETENCIES:
${competencies
  .map((c) => `${c.competency?.name} (${c.fulfillmentRating})`)
  .join('\n')}

AVAILABLE TRAININGS:
${trainings.map((t) => `${t.id}: ${t.title}`).join('\n')}

Select top 5 most relevant trainings.
Return JSON:
[
  {
    "trainingId": "...",
    "reason": "Why this training is relevant"
  }
]
`

  // 🔥 Replace with real AI later
  const fakeResponse = JSON.stringify(
    trainings.slice(0, 3).map((t) => ({
      trainingId: t.id,
      reason: `Recommended due to low performance related to "${t.title}"`,
    })),
  )

  return JSON.parse(fakeResponse) as {
    trainingId: string
    reason: string
  }[]
}
