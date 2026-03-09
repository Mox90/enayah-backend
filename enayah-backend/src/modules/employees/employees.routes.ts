import { Router } from 'express'
import * as controller from './employees.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import { employeeObjectScope } from '../../middleware/objectScope.middleware'
import { employeeListScope } from '../../middleware/listScope.middleware'
import { fieldRead, fieldWrite } from '../../middleware/field.middleware'
import { apiLimiter } from '../../middleware/rateLimit.middleware'

const router = Router()

router.use(apiLimiter)
router.use(authenticate)

router.get(
  '/',
  allowRoles('employees', 'read'),
  employeeListScope,
  fieldRead('employees'), // ⭐ HERE
  controller.list,
)

router.get(
  '/:id',
  allowRoles('employees', 'read'),
  employeeObjectScope,
  fieldRead('employees'), // ⭐ HERE
  controller.getById,
)

router.post('/', allowRoles('employees', 'create'), controller.create)

router.patch(
  '/:id',
  allowRoles('employees', 'update'),
  employeeObjectScope,
  fieldWrite('employees'), // ⭐ HERE
  controller.update,
)

router.delete(
  '/:id',
  allowRoles('employees', 'delete'),
  employeeObjectScope,
  controller.remove,
)

export default router
