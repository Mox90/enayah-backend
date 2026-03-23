import { eq, and } from 'drizzle-orm'
import { db, employees, employeeAppraisals } from '../../db'
import { AppError } from '../../utils/AppError'

export const launchAppraisal = async (
  employeeId: string,
  appraiserId: string,
  cycleId: string,
) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId),
  })

  if (!employee) throw new AppError('Employee not found', 404)

  const exists = await db.query.employeeAppraisals.findFirst({
    where: and(
      eq(employeeAppraisals.employeeId, employeeId),
      eq(employeeAppraisals.cycleId, cycleId),
    ),
  })

  if (exists) throw new AppError('Already launched', 409)

  const [appraisal] = await db
    .insert(employeeAppraisals)
    .values({
      employeeId,
      appraiserId,
      cycleId,
      status: 'draft',

      employeeNumberSnapshot: employee.employeeNumber,
      employeeNameSnapshot: `${employee.firstName} ${employee.familyName}`,
      jobTitleSnapshot: employee.positionId,
    })
    .returning()

  return appraisal
}
