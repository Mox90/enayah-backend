import { db } from '../../db'
import { consentLogs } from '../../db/schema/consentLogs'

export const recordConsent = async (
  userId: string,
  employeeId: string | null,
  type: string,
  version: string,
  given: boolean,
  context: { ip?: string; ua?: string },
) => {
  await db.insert(consentLogs).values({
    userId,
    employeeId,
    consentType: type,
    version,
    given,
    ipAddress: context.ip ?? null,
    userAgent: context.ua ?? null,
  })
}
