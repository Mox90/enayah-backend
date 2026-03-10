import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { loginSchema } from './auth.schema'
import * as service from './auth.service'
import { AppError } from '../../utils/AppError'
import { successResponse } from '../../utils/response'

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body)

  /*const context = {
    ...(req.headers['x-forwarded-for']
      ? { ip: req.headers['x-forwarded-for'].toString().split(',')[0] }
      : req.ip
        ? { ip: req.ip }
        : {}),
    ...(req.headers['user-agent'] ? { ua: req.headers['user-agent'] } : {}),
  }*/

  const context = {
    ip:
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      req.ip,

    ua: req.headers['user-agent'],
  }

  const result = await service.login(username, password, context)

  if ('error' in result) throw result.error

  return successResponse(res, result)
})
