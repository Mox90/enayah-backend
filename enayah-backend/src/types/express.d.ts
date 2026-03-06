import { roleEnum } from '../db'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: (typeof roleEnum.enumValues)[number]
        employeeId?: string | null
        departmentId?: string | null
      }
    }
  }
}

export {}
