import { db } from '../../db'
import { legalHolds } from '../../db/schema/legalHolds'
import { eq } from 'drizzle-orm'
import { AppError } from '../../utils/AppError'
import { securityLogger } from '../../config/securityLogger'

export const createLegalHold = async (
  tableName: string,
  recordId: string,
  reason: string | null,
  userId?: string,
) => {
  const [hold] = await db
    .insert(legalHolds)
    .values({
      tableName,
      recordId,
      reason,
      placedBy: userId ?? null,
      isActive: true,
    })
    .returning()

  securityLogger.warn('LEGAL_HOLD_APPLIED', {
    tableName,
    recordId,
    placedBy: userId,
    reason,
  })

  return hold
}

export const releaseLegalHold = async (id: string, userId?: string) => {
  const [updated] = await db
    .update(legalHolds)
    .set({ isActive: false })
    .where(eq(legalHolds.id, id))
    .returning()

  if (!updated) throw new AppError('Legal hold not found', 404)

  securityLogger.warn('LEGAL_HOLD_RELEASED', {
    holdId: id,
    releasedBy: userId,
  })

  return updated
}

export const listLegalHolds = async () => {
  return db.query.legalHolds.findMany({
    orderBy: (h, { desc }) => [desc(h.createdAt)],
  })
}
