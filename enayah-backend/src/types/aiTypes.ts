export type PIP = {
  objectives: string[]
  actions: string[]
  timeline: string
  successMetrics: string[]
}

export type AITranslations = {
  strengths_ar: string[]
  developmentAreas_ar: string[]
  trainingNeeds_ar: string[]
  pip_ar?: {
    objectives: string[]
    actions: string[]
    timeline: string
    successMetrics: string[]
  }
}

export type AIInsights = {
  strengths: string[]
  developmentAreas: string[]
  trainingNeeds: string[]
  needsPIP: boolean
  pip?: PIP
  translations?: AITranslations
}
