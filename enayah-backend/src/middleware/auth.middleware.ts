import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../modules/auth/jwt'
import { AppError } from '../utils/AppError'

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  console.log('AUTH HEADER:', authHeader)

  if (!authHeader) throw new AppError('Unauthorized', 401)

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Unauthorized', 401)
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded as any
  } catch {
    throw new AppError('Unauthorized', 401)
  }

  next()
}
