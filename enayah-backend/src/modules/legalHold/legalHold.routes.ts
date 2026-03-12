import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from './legalHold.controller'

const router = Router()

router.use(authenticate)

router.get('/', allowRoles('legalHold', 'read'), controller.listHolds)

router.post('/', allowRoles('legalHold', 'create'), controller.createHold)

router.patch(
  '/:id/release',
  allowRoles('legalHold', 'update'),
  controller.releaseHold,
)

export default router
