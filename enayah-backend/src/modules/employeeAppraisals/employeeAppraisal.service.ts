import { eq, and } from 'drizzle-orm'
import {
  db,
  employees,
  employeeAppraisals,
  positions,
  departments,
} from '../../db'
import { AppError } from '../../utils/AppError'

export const launchAppraisal = async (
  employeeId: string,
  appraiserId: string,
  cycleId: string,
) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId),
    with: {
      position: true,
      department: true,
    },
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
      employeeNameArSnapshot: `${employee.firstNameAr} ${employee.familyNameAr}`,
      //      jobTitleSnapshot: employee.positionId,
      jobTitleSnapshot: employee.position?.name ?? null,
      jobTitleArSnapshot: employee.position?.nameAr ?? null,
      departmentSnapshot: employee.department?.name ?? null,
      departmentArSnapshot: employee.department?.nameAr ?? null,
    })
    .returning()

  return appraisal
}
