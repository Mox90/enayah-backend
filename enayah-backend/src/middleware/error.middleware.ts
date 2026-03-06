import { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError'
import { logger } from '../config/logger'

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  logger.error(err)

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
}
