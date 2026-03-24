import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './appraisalApproval.controller'

const router = Router()

router.use(authenticate)

/**
 * 🟡 MANAGER
 */
router.post(
  '/:id/submit',
  allowRoles('employeeAppraisals', 'update'),
  controller.submitController,
)

/**
 * 🔵 EMPLOYEE
 */
router.post(
  '/:id/acknowledge',
  allowRoles('employeeAppraisals', 'read'),
  controller.acknowledgeController,
)

/**
 * 🟢 HR
 */
router.post(
  '/:id/approve',
  allowRoles('employeeAppraisals', 'update'),
  controller.approveController,
)

export default router
