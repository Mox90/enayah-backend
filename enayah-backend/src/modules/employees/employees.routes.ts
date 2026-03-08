import { Router } from 'express'
import * as controller from './employees.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { allowRoles } from '../../middleware/rbac.middleware'
import { employeeObjectScope } from '../../middleware/objectScope.middleware'
import { employeeListScope } from '../../middleware/listScope.middleware'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  allowRoles('employees', 'read'),
  employeeListScope,
  controller.list,
)

router.get(
  '/:id',
  allowRoles('employees', 'read'),
  employeeObjectScope,
  controller.getById,
)

router.post('/', allowRoles('employees', 'create'), controller.create)

router.patch(
  '/:id',
  allowRoles('employees', 'update'),
  employeeObjectScope,
  controller.update,
)

router.delete(
  '/:id',
  allowRoles('employees', 'delete'),
  employeeObjectScope,
  controller.remove,
)

export default router
