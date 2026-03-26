import { z } from 'zod'

export const launchAppraisalSchema = z.object({
  employeeId: z.uuid(),
  cycleId: z.uuid(),
})

export const appraisalFeedbackSchema = z.object({
  appraisalId: z.uuid(),

  strengths: z.string().min(5),
  developmentAreas: z.string().min(5),

  comments: z.string().optional(),
})
