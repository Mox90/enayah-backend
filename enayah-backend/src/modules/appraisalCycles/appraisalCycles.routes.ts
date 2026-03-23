import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './appraisal.controller'

const router = Router()

/**
 * 🟣 All routes require authentication
 */
router.use(authenticate)

/**
 * 🟣 CREATE CYCLE (YEARLY)
 * - Typically HR / Admin only
 */
router.post(
  '/',
  allowRoles('employeeAppraisals', 'create'), // or stricter: ['hr', 'admin']
  controller.createCycleController,
)

export default router
