import { db } from '../db'
import { legalHolds } from '../db/schema/legalHolds'
import { and, eq } from 'drizzle-orm'
import { AppError } from './AppError'

export const assertNoLegalHold = async (
  tx: any,
  tableName: string,
  recordId: string,
) => {
  const hold = await tx.query.legalHolds.findFirst({
    where: and(
      eq(legalHolds.tableName, tableName),
      eq(legalHolds.recordId, recordId),
      eq(legalHolds.isActive, true),
    ),
  })

  if (hold) {
    throw new AppError('This record is under legal hold', 409)
  }
}
