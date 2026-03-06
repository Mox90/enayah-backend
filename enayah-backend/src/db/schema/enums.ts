import { pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('user_role', [
  'admin',
  'hr',
  'manager',
  'employee',
  'director',
])

export const appraisalStatusEnum = pgEnum('appraisal_status', [
  'draft',
  'submitted',
  'manager_review',
  'hr_review',
  'closed',
])

export const pipStatusEnum = pgEnum('pip_status', [
  'active',
  'completed',
  'failed',
])

export const genderEnum = pgEnum('gender', ['male', 'female'])
