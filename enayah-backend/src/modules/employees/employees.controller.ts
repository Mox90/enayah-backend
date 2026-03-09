import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import * as service from './employees.service'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeeQuerySchema,
} from './employees.schema'
import { successResponse } from '../../utils/response'
import { AppError } from '../../utils/AppError'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listEmployeeQuerySchema.parse(req.query)
  console.log(`QUERY AFTER PARSE`, query)
  const result = await service.listEmployees({
    ...query,
    ...req.scope,
    role: req.user?.role,
  })

  //if ('error' in result) throw result.error

  return successResponse(res, result, 'Employees successfully retrieved')
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  //if (!id) return res.status(400).json({ message: 'Employee ID required' })
  if (!id) throw new AppError('Employee ID required', 400)
  const result = await service.getEmployeeById(id)

  //if ('error' in result) throw result.error

  return successResponse(res, result, 'Employee successfully retrieved')
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = createEmployeeSchema.parse(req.body)
  const result = await service.createEmployee(data, req.user?.id)
  /*res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: result,
  })*/
  res.status(201)
  return successResponse(res, result, 'Employee created successfully')
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  //if (!id) return res.status(400).json({ message: 'Employee ID required' })
  if (!id) throw new AppError('Employee ID required', 400)

  const data = updateEmployeeSchema.parse(req.body)
  const result = await service.updateEmployee(id, data, req.user?.id)

  //if ('error' in result) throw result.error

  return successResponse(res, result, 'Employee successfully updated')
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  //if (!id) return res.status(400).json({ message: 'Employee ID required' })
  if (!id) throw new AppError('Employee ID required', 400)

  await service.deleteEmployee(id, req.user?.id)
  //res.status(204).send()
  return successResponse(res, null, 'Employee deleted successfully')
})
