import z from 'zod'

export const launchAppraisalSchema = z.object({
  employeeId: z.uuid(),
  cycleId: z.uuid(),
})
