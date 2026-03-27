import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './employeeAppraisals.controller'
import { enforceAppraisalPhase } from '../../middleware/appraisalPhase.middleware'

const router = Router()

// 🟣 All routes require authentication
router.use(authenticate)

/**
 * 🟣 LAUNCH APPRAISAL
 */
router.post(
  '/launch',
  allowRoles('employeeAppraisals', 'create'),
  controller.launchAppraisalController,
)

/**
 * 🟣 UPDATE FEEDBACK (Draft only)
 */
router.put(
  '/feedback',
  allowRoles('employeeAppraisals', 'update'),
  controller.updateFeedbackController,
)

/**
 * 🟣 SUBMIT PLANNING (Manager/Director)
 */
router.post(
  '/:id/planning-submit',
  allowRoles('employeeAppraisals', 'update'),
  enforceAppraisalPhase('submitPlanning'),
  controller.submitPlanningController,
)

/**
 * 🟣 ACKNOWLEDGE (Planning + Evaluation)
 * 🔥 SINGLE ENDPOINT (phase-driven)
 */
router.post(
  '/:id/acknowledge',
  allowRoles('employeeAppraisals', 'update'),
  enforceAppraisalPhase('acknowledge'), // 🔥 unified
  controller.acknowledgeAppraisalController,
)

router.get(
  '/:id/generate-feedback',
  allowRoles('employeeAppraisals', 'read'),
  controller.generateFeedbackController,
)

/**
 * 🟣 SUBMIT FINAL EVALUATION
 */
router.post(
  '/:id/submit',
  allowRoles('employeeAppraisals', 'update'),
  enforceAppraisalPhase('submitEvaluation'),
  controller.submitAppraisalController,
)

/**
 * 🟣 HR APPROVAL
 */
router.post(
  '/:id/approve',
  allowRoles('employeeAppraisals', 'update'),
  enforceAppraisalPhase('approveHR'),
  controller.approveAppraisalController,
)

/**
 * 🟣 REJECT (Employee)
 */
router.post(
  '/:id/reject',
  allowRoles('employeeAppraisals', 'update'),
  enforceAppraisalPhase('reject'),
  controller.rejectAppraisalController,
)

/**
 * 🟣 REOPEN (Manager/Director)
 */
router.post(
  '/:id/reopen',
  allowRoles('employeeAppraisals', 'update'),
  enforceAppraisalPhase('reopen'),
  controller.reopenAppraisalController,
)

export default router
