import { logger } from './logger'

export const securityLogger = {
  log: (event: string, payload: Record<string, any>) => {
    logger.info({
      category: 'SECURITY',
      event,
      ...payload,
    })
  },

  warn: (event: string, payload: Record<string, any>) => {
    logger.warn({
      category: 'SECURITY',
      event,
      ...payload,
    })
  },

  error: (event: string, payload: Record<string, any>) => {
    logger.error({
      category: 'SECURITY',
      event,
      ...payload,
    })
  },
}
