import { Router } from 'express'
import { updatePIPController } from './pip.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'

const router = Router()

router.use(authenticate)

// 🔥 Update PIP
//router.put('/:appraisalId/progress', updatePIPController)
router.put(
  '/:appraisalId/progress',
  allowRoles('employeeAppraisals', 'update'),
  updatePIPController,
)

export default router
