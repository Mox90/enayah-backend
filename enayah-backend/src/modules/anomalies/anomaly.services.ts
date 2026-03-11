import { anomalyLogs, db } from '../../db'
//import { anomalyLogs } from '../../db/schema/anomalyLogs'

export const logAnomaly = async (
  type: string,
  metadata: Record<string, any>,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
) => {
  await db.insert(anomalyLogs).values({
    type,
    metadata,
    severity,
    userId: metadata.userId ?? null,
  })
}
