import { eq } from 'drizzle-orm'
import { db, employees } from '../../db'

export const getAllSubordinates = async (managerId: string) => {
  const result: string[] = []

  const stack = [managerId]

  while (stack.length) {
    const current = stack.pop()!

    const subs = await db.query.employees.findMany({
      where: eq(employees.managerId, current),
      columns: { id: true },
    })

    for (const s of subs) {
      result.push(s.id)
      stack.push(s.id)
    }
  }

  return result
}
