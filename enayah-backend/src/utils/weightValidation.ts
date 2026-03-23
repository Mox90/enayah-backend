import { z } from 'zod'

export const validateTotalWeight = (
  items: { relativeWeight: number }[],
  ctx: z.RefinementCtx,
  label: string,
) => {
  // ✅ 1. weight validation
  const total = items.reduce((sum, i) => sum + i.relativeWeight, 0)

  if (total !== 100) {
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
