import { db } from '../db'
import { legalHolds } from '../db/schema/legalHolds'
import { and, eq } from 'drizzle-orm'

export const assertNoLegalHold = async (
  tableName: string,
  recordId: string,
) => {
  const hold = await db.query.legalHolds.findFirst({
    where: and(
      eq(legalHolds.tableName, tableName),
      eq(legalHolds.recordId, recordId),
      eq(legalHolds.isActive, true),
    ),
  })

  if (hold) {
    throw new Error('This record is under legal hold')
  }
}
