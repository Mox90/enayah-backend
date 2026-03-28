import { z } from 'zod'

export const launchAppraisalSchema = z.object({
  employeeId: z.uuid(),
  cycleId: z.uuid(),
})

export const appraisalFeedbackSchema = z.object({
  appraisalId: z.uuid(),

  strengths: z.array(z.string()),
  developmentAreas: z.array(z.string()),

  comments: z.string().optional(),
})
