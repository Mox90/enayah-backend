import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import * as controller from '../anomalies/anomaly.controller'

const router = Router()

router.use(authenticate)

router.get('/', allowRoles('anomalies', 'read'), controller.listAnomalies)

router.patch(
  '/:id/resolve',
  allowRoles('anomalies', 'update'),
  controller.resolveAnomaly,
)

export default router
