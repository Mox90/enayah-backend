import { Router } from 'express'
import { updatePIPController } from './pip.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

// 🔥 Update PIP
router.put('/:appraisalId/progress', updatePIPController)

export default router
