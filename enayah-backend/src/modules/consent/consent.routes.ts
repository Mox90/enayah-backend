import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import * as controller from './consent.controller'

const router = Router()

router.use(authenticate)

router.post('/', controller.giveConsent)

export default router
