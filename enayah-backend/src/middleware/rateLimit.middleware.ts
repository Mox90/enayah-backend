import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redis } from '../redis'
import type { RedisReply } from 'rate-limit-redis'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: async (command: string, ...args: string[]) =>
      (await redis.call(command, ...args)) as unknown as RedisReply,
  }),

  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  },
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: async (command: string, ...args: string[]) =>
      (await redis.call(command, ...args)) as unknown as RedisReply,
  }),

  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
})
