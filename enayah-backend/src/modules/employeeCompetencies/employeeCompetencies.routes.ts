import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './employeeCompetencies.controller'

const router = Router()

/**
 * 🟣 All routes require authentication
 */
router.use(authenticate)

/**
 * 🟣 PLANNING (JANUARY)
 * - Assign competencies + weights
 */
router.post(
  '/planning',
  allowRoles('employeeAppraisals', 'update'),
  controller.savePlanningCompetenciesController,
)

/**
 * 🟣 SCORING (DECEMBER)
 * - Update competency ratings
 */
router.put(
  '/scoring',
  allowRoles('employeeAppraisals', 'update'),
  controller.updateCompetencyRatingsController,
)

export default router
