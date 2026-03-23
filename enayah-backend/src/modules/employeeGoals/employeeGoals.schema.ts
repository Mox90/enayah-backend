import z from 'zod'

export const goalItemSchema = z.object({
  title: z.string().min(3),
  measurementStandard: z.string().optional().nullable(),
  relativeWeight: z.number().min(1).max(100),
  targetOutput: z.string().optional().nullable(),

  // ❗ MUST BE NULL IN JANUARY
  fulfillmentRating: z.null().optional(),
})
