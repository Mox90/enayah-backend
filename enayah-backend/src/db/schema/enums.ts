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
  'calibrated',
  'closed',
])

export const pipStatusEnum = pgEnum('pip_status', [
  'active',
  'completed',
  'failed',
])

export type PipStatus = 'active' | 'completed' | 'failed'

export const pipOutcomeEnum = pgEnum('pip_outcome', ['successful', 'failed'])

export const genderEnum = pgEnum('gender', ['male', 'female'])

export const appraisalRatingEnum = pgEnum('appraisal_rating', [
  'outstanding',
  'exceeds',
  'meets',
  'needs_improvement',
  'unsatisfactory',
])

export const pipLevelEnum = pgEnum('pip_level', ['moderate', 'critical'])
