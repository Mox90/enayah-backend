import { Router } from 'express'
import * as controller from './auth.controller'
import { authLimiter } from '../../middleware/rateLimit.middleware'

const router = Router()

router.post('/login', authLimiter, controller.login)

export default router
