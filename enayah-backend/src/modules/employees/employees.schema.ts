import { z } from 'zod'

export const createEmployeeSchema = z.object({
  employeeNumber: z.string().min(1),

  firstName: z.string().min(1),
  secondName: z.string().optional(),
  thirdName: z.string().optional(),
  familyName: z.string().min(1),

  firstNameAr: z.string().min(1),
  secondNameAr: z.string().optional(),
  thirdNameAr: z.string().optional(),
  familyNameAr: z.string().min(1),

  dateOfBirth: z.iso.datetime().optional(),

  gender: z.enum(['male', 'female']).optional(),

  nationality: z.uuid().optional(),

  positionId: z.uuid(),
  departmentId: z.uuid(),

  managerId: z.uuid().optional().nullable(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  version: z.number().int().positive(),
})

export const listEmployeeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),

  departmentId: z.uuid().optional(),
  employeeId: z.uuid().optional(),
  managerId: z.uuid().optional(),
})
