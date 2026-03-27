export const generateSMARTObjectives = (
  lowGoals: any[],
  lowCompetencies: any[],
) => {
  const objectives: string[] = []

  for (const g of lowGoals) {
    objectives.push(
      `Improve "${g.title}" by achieving target: "${g.targetOutput}" within 60 days.`,
    )
  }

  for (const c of lowCompetencies) {
    objectives.push(
      `Enhance competency "${c.competency?.name}" to reach minimum rating of 3 within 60 days.`,
    )
  }

  return objectives
}

export const generateSuccessCriteria = () => {
  return `
- Achieve minimum rating of 3 in all identified areas
- Demonstrate consistent performance improvement over review period
- Meet departmental KPIs and quality indicators
- Positive supervisor evaluation at end of PIP period
`
}
