import { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError'
import { logger } from '../config/logger'
import { ZodError } from 'zod'

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log('ERROR INSTANCE:', err instanceof AppError)
  console.log('ERROR TYPE:', err.constructor.name)
  console.log('ERROR:', err)

  // ✅ ZOD
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.issues.map((i) => i.message),
    })
  }

  // ✅ APP ERROR
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // ✅ FALLBACK FOR KNOWN VALIDATION ERRORS
  if (err.message?.includes('weight must equal')) {
    return res.status(400).json({
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
