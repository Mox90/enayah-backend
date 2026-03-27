import { z } from 'zod'

export const trainingMatchSchema = z.array(
  z.object({
    trainingId: z.uuid(),
    reason: z.string().min(5),
  }),
)

export type TrainingMatch = z.infer<typeof trainingMatchSchema>
