import { success } from 'zod'

export const successResponse = (res: any, data: any, message = 'Success') => {
  return res.json({
    success: true,
    message,
    data,
  })
}

export const errorResponse = (res: any, message: string, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}
