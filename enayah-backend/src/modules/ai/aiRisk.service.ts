export const predictRisk = (data: { goals: any[]; competencies: any[] }) => {
  const lowGoals = data.goals.filter(
    (g) => g.fulfillmentRating != null && g.fulfillmentRating <= 2,
  )

  const lowCompetencies = data.competencies.filter(
    (c) => c.fulfillmentRating != null && c.fulfillmentRating <= 2,
  )

  const riskScore = lowGoals.length * 2 + lowCompetencies.length * 3

  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  //if (riskScore >= 10) riskLevel = 'high'
  //else if (riskScore >= 5) riskLevel = 'medium'
  if (lowGoals.length >= 2 || lowCompetencies.length >= 2 || riskScore >= 7) {
    riskLevel = 'high'
  } else if (riskScore >= 3) {
    riskLevel = 'medium'
  }

  return {
    riskLevel,
    riskScore,
    reasons: [
      ...lowGoals.map((g) => `Low goal: ${g.title}`),
      ...lowCompetencies.map(
        (c) =>
          `Low competency: ${c.competency?.name || 'Competency'} (Rating: ${c.fulfillmentRating})`,
      ),
    ],
  }
}
