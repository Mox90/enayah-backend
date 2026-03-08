import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import * as service from './employees.service'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeeQuerySchema,
} from './employees.schema'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listEmployeeQuerySchema.parse(req.query)
  console.log(`QUERY AFTER PARSE`, query)
  const result = await service.listEmployees({
    ...query,
    ...req.scope,
    role: req.user?.role,
  })
  res.json(result)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id) return res.status(400).json({ message: 'Employee ID required' })

  const result = await service.getEmployeeById(id)
  res.json(result)
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = createEmployeeSchema.parse(req.body)
  const result = await service.createEmployee(data)
  res.status(201).json(result)
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id) return res.status(400).json({ message: 'Employee ID required' })

  const data = updateEmployeeSchema.parse(req.body)
  const result = await service.updateEmployee(id, data)
  res.json(result)
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id) return res.status(400).json({ message: 'Employee ID required' })

  await service.deleteEmployee(id)
  res.status(204).send()
})
