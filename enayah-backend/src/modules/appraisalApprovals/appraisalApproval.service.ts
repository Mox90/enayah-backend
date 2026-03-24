import { eq } from 'drizzle-orm'
import { db, employeeAppraisals, appraisalApprovals } from '../../db'
import { AppError } from '../../utils/AppError'
import {
  APPROVAL_ACTIONS,
  APPROVAL_ROLES,
} from '../../types/appraisalApproval.types'

/**
 * 🟡 MANAGER SUBMIT
 */
export const submitAppraisal = async (appraisalId: string, userId: string) => {
  return db.transaction(async (tx) => {
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    if (appraisal.status !== 'draft') {
      throw new AppError('Already submitted', 400)
    }

    // ✅ update status
    await tx
      .update(employeeAppraisals)
      .set({ status: 'submitted' })
      .where(eq(employeeAppraisals.id, appraisalId))

    // ✅ audit log
    await tx.insert(appraisalApprovals).values({
      appraisalId,
      userId,
      role: APPROVAL_ROLES.MANAGER,
      action: APPROVAL_ACTIONS.SUBMIT,
    })

    return true
  })
}

/**
 * 🔵 EMPLOYEE ACKNOWLEDGE
 */
export const acknowledgeAppraisal = async (
  appraisalId: string,
  userId: string,
) => {
  return db.transaction(async (tx) => {
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    if (appraisal.status !== 'submitted') {
      throw new AppError('Appraisal not ready for acknowledgment', 400)
    }

    await tx
      .update(employeeAppraisals)
      .set({ status: 'manager_review' })
      .where(eq(employeeAppraisals.id, appraisalId))

    await tx.insert(appraisalApprovals).values({
      appraisalId,
      userId,
      role: 'employee', //APPROVAL_ROLES.EMPLOYEE,
      action: 'acknowledge', //APPROVAL_ACTIONS.ACKNOWLEDGE,
    })

    return true
  })
}

/**
 * 🟢 HR APPROVE
 */
export const approveAppraisal = async (appraisalId: string, userId: string) => {
  return db.transaction(async (tx) => {
    const appraisal = await tx.query.employeeAppraisals.findFirst({
      where: eq(employeeAppraisals.id, appraisalId),
    })

    if (!appraisal) throw new AppError('Appraisal not found', 404)

    if (appraisal.status !== 'manager_review') {
      throw new AppError('Appraisal not ready for approval', 400)
    }

    await tx
      .update(employeeAppraisals)
      .set({ status: 'hr_review' })
      .where(eq(employeeAppraisals.id, appraisalId))

    await tx.insert(appraisalApprovals).values({
      appraisalId,
      userId,
      role: 'hr', //APPROVAL_ROLES.HR,
      action: 'approve', //APPROVAL_ACTIONS.APPROVE,
    })

    return true
  })
}
