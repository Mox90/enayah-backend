import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './employeeGoals.controller'

const router = Router()

/**
 * 🟣 All routes require authentication
 */
router.use(authenticate)

/**
 * 🟣 PLANNING (JANUARY)
 * - Create / overwrite goals
 */
router.post(
  '/planning',
  allowRoles('employeeAppraisals', 'update'), // manager / director / hr
  controller.savePlanningGoalsController,
)

/**
 * 🟣 SCORING (DECEMBER)
 * - Update ratings only
 */
router.put(
  '/scoring',
  allowRoles('employeeAppraisals', 'update'),
  controller.updateGoalRatingsController,
)

export default router
