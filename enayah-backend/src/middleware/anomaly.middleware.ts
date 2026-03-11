import { and, eq, gt } from 'drizzle-orm'
import { Request, Response, NextFunction } from 'express'
import { db, auditLogs } from '../db'
import { logAnomaly } from '../modules/anomalies/anomaly.services'
import { ANOMALY_TYPES } from '../modules/anomalies/anomaly.types'

export const anomalyBurstDetector = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next()

    const lastMinute = new Date(Date.now() - 60000)

    const count = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.performedBy, req.user.id),
        gt(auditLogs.createdAt, lastMinute),
      ),
    })

    if (count.length > 50) {
      await logAnomaly(
        ANOMALY_TYPES.REQUEST_BURST,
        {
          userId: req.user.id,
          count: count.length,
        },
        'HIGH',
      )
    }
    next()
  } catch (err) {
    next()
  }
}

export const suspiciousReadDetector = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return next()

    // ⭐ Only monitor list endpoints
    if (!req.originalUrl.includes('/employees')) return next()

    const lastMinute = new Date(Date.now() - 60000)

    const reads = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.performedBy, req.user.id),
        eq(auditLogs.action, 'READ'),
        gt(auditLogs.createdAt, lastMinute),
      ),
    })

    if (reads.length > 30) {
      await logAnomaly(
        ANOMALY_TYPES.SUSPICIOUS_BULK_READ,
        {
          userId: req.user.id,
          count: reads.length,
        },
        'MEDIUM',
      )
    }

    next()
  } catch {
    next()
  }
}
