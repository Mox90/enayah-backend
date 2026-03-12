import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './legalHold.service'
import { AppError } from '../../utils/AppError'

export const createHold = asyncHandler(async (req: Request, res: Response) => {
  const { tableName, recordId, reason } = req.body

  if (!tableName || !recordId) {
    //throw new Error('tableName and recordId are required')
    throw new AppError('tableName and recordId are required', 400)
  }

  const result = await service.createLegalHold(
    tableName,
    recordId,
    reason ?? null,
    req.user?.id,
  )

  return successResponse(res, result, 'Legal hold applied')
})

export const releaseHold = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id

  if (!id) throw new Error('Hold ID required')

  const result = await service.releaseLegalHold(id, req.user?.id)

  return successResponse(res, result, 'Legal hold released')
})

export const listHolds = asyncHandler(async (_req: Request, res: Response) => {
  const result = await service.listLegalHolds()

  //console.log('HELLOO')

  return successResponse(res, result, 'Legal holds retrieved')
})
