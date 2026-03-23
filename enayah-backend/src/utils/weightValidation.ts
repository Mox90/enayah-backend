import { z } from 'zod'

const EPSILON = 1e-6

export const validateTotalWeight = (
  items: { relativeWeight: number }[],
  ctx: z.RefinementCtx,
  label: string,
) => {
  // ✅ 1. weight validation
  const total = items.reduce((sum, i) => sum + i.relativeWeight, 0)

  if (Math.abs(total - 100) > EPSILON) {
    ctx.addIssue({
      code: 'custom',
      message: `${label} weight must equal 100%`,
    })
  }
}

export const validateNoRating = (
  items: { fulfillmentRating?: number | null | undefined }[],
  ctx: z.RefinementCtx,
) => {
  // ✅ 2. rating validation
  const hasRating = items.some((i) => i.fulfillmentRating != null)

  if (hasRating) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ratings are not allowed during planning stage',
    })
  }
}
