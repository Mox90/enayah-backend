import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { recordConsent } from './consent.service'
import { successResponse } from '../../utils/response'

export const giveConsent = asyncHandler(async (req: Request, res: Response) => {
  const { type, version, given, employeeId } = req.body

  const context = {
    ...(req.ip ? { ip: req.ip } : {}),
    ...(req.headers['user-agent'] ? { ua: req.headers['user-agent'] } : {}),
  }

  await recordConsent(
    req.user!.id,
    employeeId ?? null,
    type,
    version,
    given,
    context,
  )

  return successResponse(res, true, 'Consent recorded')
})
