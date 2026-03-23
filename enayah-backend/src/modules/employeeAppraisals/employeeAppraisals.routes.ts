import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './employeeAppraisals.controller'

const router = Router()

/**
 * 🟣 All routes require authentication
 */
router.use(authenticate)

/**
 * 🟣 LAUNCH APPRAISAL (JANUARY)
 * - Manager starts appraisal for employee
 */
router.post(
  '/launch',
  allowRoles('employeeAppraisals', 'create'),
  controller.launchAppraisalController,
)

/**
 * 🟣 SUBMIT FINAL APPRAISAL (DECEMBER)
 * - Calls submitScoring()
 */
router.post(
  '/:id/submit',
  allowRoles('employeeAppraisals', 'update'),
  controller.submitAppraisalController,
  //async (req, res, next) => {
  // delegate to appraisal.service.submitScoring
  //  next()
  //},
)

export default router
