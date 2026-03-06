import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { loginSchema } from './auth.schema'
import * as service from './auth.service'

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body)

  const result = await service.login(username, password)

  res.json(result)
})
