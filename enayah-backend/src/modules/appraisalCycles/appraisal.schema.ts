import { z } from 'zod'

export const createCycleSchema = z.object({
  year: z.number().int().min(2020).max(2100),
})
