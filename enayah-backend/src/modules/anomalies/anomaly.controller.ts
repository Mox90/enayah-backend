import { Request, Response } from 'express'
import { anomalyLogs, db } from '../../db'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import { eq } from 'drizzle-orm'
import { AppError } from '../../utils/AppError'

export const listAnomalies = asyncHandler(
  async (_req: Request, res: Response) => {
    try {
      const result = await db.query.anomalyLogs.findMany({
        orderBy: (a, { desc }) => [desc(a.createdAt)],
        limit: 100,
      })

      return successResponse(res, result)
    } catch (err) {
      console.error('ANOMALY LIST ERROR:', err)
      return res.status(500).json({ error: err })
    }
  },
)

export const resolveAnomaly = asyncHandler(
  async (req: Request, res: Response) => {
    //const { id } = req.params
    const rawId = req.params

    const { id } = Array.isArray(rawId) ? rawId[0] : rawId

    if (!id) throw new AppError('Anomaly ID required', 400)

    await db
      .update(anomalyLogs)
      .set({ status: 'RESOLVED' })
      .where(eq(anomalyLogs.id, id))

    return successResponse(res, true)
  },
)
