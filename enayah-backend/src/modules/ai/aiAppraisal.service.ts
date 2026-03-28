import { AIInsights } from '../../types/aiTypes'
import { callAI } from './aiClient'
import { withRetry } from './aiRetry'
import { TrainingMatch, trainingMatchSchema } from './aiValidator'

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

export const generateAIInsights = async (payload: any): Promise<AIInsights> => {
  // 🔹 1. FALLBACK LOGIC (your original logic)
  const lowGoals = payload.goals.filter(
    (g: any) => g.fulfillmentRating != null && g.fulfillmentRating <= 2,
  )

  const highGoals = payload.goals.filter(
    (g: any) => g.fulfillmentRating != null && g.fulfillmentRating >= 4,
  )

  const lowCompetencies = payload.competencies.filter(
    (c: any) => c.fulfillmentRating != null && c.fulfillmentRating <= 2,
  )

  const fallback = {
    strengths: highGoals.map((g: any) => g.title),
    developmentAreas: lowGoals.map((g: any) => g.title),
    trainingNeeds: [
      'Clinical documentation standards',
      'Patient safety and quality improvement',
    ],
    needsPIP: lowGoals.length > 0 || lowCompetencies.length > 0,
  }

  // 🔹 2. AI PROMPT
  const prompt = `
You are a senior HR performance evaluator.

Analyze employee performance using ratings and identified risk factors.

IMPORTANT:
- DO NOT repeat goal titles directly
- Convert them into professional performance insights
- Use risk factors to explain WHY improvement is needed
- Explain strengths and weaknesses in meaningful terms
- Focus on behavior and performance, not labels

If needsPIP is true, you MUST generate a detailed Performance Improvement Plan (PIP).

DO NOT skip the PIP.

PIP must include:
- objectives (specific weak areas based on low ratings)
- actions (clear steps to improve)
- timeline (30–60 days)
- successMetrics (measurable outcomes)

Example:

{
  "pip": {
    "objectives": [
      "Improve documentation accuracy",
      "Reduce medication errors"
    ],
    "actions": [
      "Attend clinical documentation training",
      "Follow medication safety checklist"
    ],
    "timeline": "60 days",
    "successMetrics": [
      "Achieve 98% documentation accuracy",
      "Reduce medication errors by 20%"
    ]
  }
}

Return JSON with "pip" field ONLY if needsPIP = true.

DATA:

Goals:
${payload.goals.map((g: any) => `- ${g.title} (Rating: ${g.rating})`).join('\n')}

Competencies:
${payload.competencies.map((c: any) => `- Rating: ${c.rating}`).join('\n')}

Risk Level: ${payload.riskLevel}

Risk Factors:
${payload.riskReasons.map((r: string) => `- ${r}`).join('\n')}

Return STRICT JSON:

{
  "strengths": [],
  "developmentAreas": [],
  "trainingNeeds": [],
  "needsPIP": boolean,
  "pip": {
    "objectives": [],
    "actions": [],
    "timeline": "",
    "successMetrics": []
  },

  "translations": {
    "strengths_ar": [],
    "developmentAreas_ar": [],
    "trainingNeeds_ar": [],
    "pip_ar": {
      "objectives": [],
      "actions": [],
      "timeline": "",
      "successMetrics": []
    }
  }
}

Also return Arabic translations for all text fields.

Rules:
- Translate professionally into Arabic
- Keep meaning accurate (HR / healthcare context)
- Do NOT leave translations empty

Examples:

Strength:
❌ "Enhance infection control compliance"
✅ "Demonstrates strong adherence to infection control protocols"

Development:
❌ "Improve documentation accuracy"
✅ "Documentation accuracy requires improvement based on audit findings"

Training:
"Clinical documentation standards training"
`

  try {
    const raw = await callAI(prompt)
    console.log('🔥 RAW AI:', raw)

    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}') + 1
    const jsonString = raw.slice(jsonStart, jsonEnd)

    const parsed = JSON.parse(jsonString)

    // 🔥 3. SAFETY CHECK
    const needsPIP =
      typeof parsed.needsPIP === 'boolean' ? parsed.needsPIP : fallback.needsPIP

    // 🔥 NEW: Smart PIP fallback
    let pip = parsed.pip

    if (needsPIP && (!pip || !pip.objectives?.length)) {
      pip = {
        objectives: lowGoals.map((g: any) => `Improve ${g.title}`),
        actions: [
          'Attend relevant training programs',
          'Follow supervisor guidance and monitoring',
        ],
        timeline: '60 days',
        successMetrics: [
          'Achieve target performance ratings',
          'Demonstrate measurable improvement',
        ],
      }
    }

    return {
      strengths: ensureMinItems(parsed.strengths, fallback.strengths),

      developmentAreas: ensureMinItems(
        parsed.developmentAreas,
        fallback.developmentAreas,
      ),

      trainingNeeds: normalize(
        parsed.trainingNeeds?.length
          ? parsed.trainingNeeds
          : fallback.trainingNeeds,
      ),

      needsPIP,

      pip: needsPIP ? pip : null,
      translations: parsed.translations || null,
    }
  } catch (err) {
    console.error('AI FAILED → using fallback')

    return fallback
  }
}

export const matchTrainingsWithAI = async ({
  goals,
  competencies,
  trainings,
}: {
  goals: any[]
  competencies: any[]
  trainings: { id: string; title: string }[]
}): Promise<TrainingMatch> => {
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
Return STRICT JSON only:
[
  {
    "trainingId": "uuid",
    "reason": "clear justification"
  }
]
`

  try {
    const raw = await withRetry(() => callAI(prompt))

    const parsed = JSON.parse(raw)

    return trainingMatchSchema.parse(parsed)
  } catch (err) {
    console.error('AI FAILED → fallback triggered', err)

    // 🔥 SAFE FALLBACK
    return trainings.slice(0, 3).map((t) => ({
      trainingId: t.id,
      reason: `Fallback: related to ${t.title}`,
    }))
  }
}

const ensureMinItems = (arr: string[], fallback: string[]) => {
  if (!arr || arr.length < 2) return fallback
  return arr
}

const normalize = (arr: string[]) => [...new Set(arr.map((t) => t.trim()))]
