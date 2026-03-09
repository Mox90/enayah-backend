import rateLimit from 'express-rate-limit'
//import { success } from "zod"

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  },
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
})
