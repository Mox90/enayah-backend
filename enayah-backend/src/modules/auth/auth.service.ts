import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db, users } from '../../db'
import { AppError } from '../../utils/AppError'
import { generateToken } from './jwt'

export const login = async (username: string, password: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user) throw new AppError('Invalid credentials', 401)

  if (!user.isActive) throw new AppError('Account disabled', 403)

  if (user.lockedUntil && new Date() < user.lockedUntil) {
    throw new AppError('Account locked. Please try again later!', 403)
  }

  if (!user.passwordHash) {
    throw new AppError('Invalid user configuration', 500)
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)

  if (!validPassword) {
    throw new AppError('Invalid credentials', 401)
  }

  return {
    token: generateToken({
      id: user.id,
      role: user.role,
      employeeId: user.employeeId,
      //departmentId: user.departmentId,
    }),
  }
}
