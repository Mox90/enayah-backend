import bcrypt from 'bcrypt'
import { eq, sql } from 'drizzle-orm'
import { db, employees, users } from '../../db'
import { AppError } from '../../utils/AppError'
import { generateToken } from './jwt'
import { logger } from '../../config/logger'
import { loginLogs } from '../../db/schema/loginLogs'

export const login = async (
  username: string,
  password: string,
  context: { ip?: string | undefined; ua?: string | undefined },
) => {
  const result = db.transaction(async (tx) => {
    const logAttempt = async (success: boolean, userId?: string) => {
      await tx.insert(loginLogs).values({
        userId: userId ?? null,
        username,
        success,
        ipAddress: context.ip ?? null,
        userAgent: context.ua ?? null,
      })
    }

    const user = await tx.query.users.findFirst({
      where: eq(users.username, username),
    })

    // ❌ USER NOT FOUND
    if (!user) {
      await logAttempt(false)
      //throw new AppError('Invalid credentials', 401)
      return { error: new AppError('Invalid credentials', 401) }
    }

    // ❌ DISABLED
    if (!user.isActive) {
      logger.warn('Login attempt on disabled account!', { username })
      await logAttempt(false, user.id)
      //throw new AppError('Invalid credentials', 401)
      return { error: new AppError('Invalid credentials', 401) }
    }

    // ❌ LOCKED
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      logger.warn('Login attempt on disabled account!', { username })
      await logAttempt(false, user.id)
      //throw new AppError('Invalid credentials', 401)
      return { error: new AppError('Invalid credentials', 401) }
    }

    // 🔐 LOCAL LOGIN ONLY
    if (user.authProvider === 'local') {
      if (!user.passwordHash) {
        throw new AppError('Invalid user configuration', 500)
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash)

      if (!validPassword) {
        await tx
          .update(users)
          .set({
            failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
            lockedUntil: sql`CASE WHEN ${users.failedLoginAttempts} + 1 >= 5 
              THEN NOW() + INTERVAL '15 minutes' ELSE NULL END`,
          })
          .where(eq(users.id, user.id))

        await logAttempt(false, user.id)
        //throw new AppError('Invalid credentials', 401)
        return { error: new AppError('Invalid credentials', 401) }
      }
    } else if (user.authProvider === 'ad') {
      logger.warn('AD login attempted but not configured', { username })
      await logAttempt(false, user.id)
      return { error: new AppError('Invalid credentials', 401) }
    } else {
      logger.error('Unknown auth provider', {
        username,
        provider: user.authProvider,
      })
      await logAttempt(false, user.id)
      return { error: new AppError('Invalid credentials', 401) }
    }

    const employee = user.employeeId
      ? await tx.query.employees.findFirst({
          where: eq(employees.id, user.employeeId),
        })
      : null

    // ✅ RESET SUCCESS
    await tx
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id))

    await logAttempt(true, user.id)

    return {
      token: generateToken({
        id: user.id,
        role: user.role,
        employeeId: user.employeeId,
        departmentId: employee?.departmentId ?? null,
      }),
    }
  })

  //if ('error' in result) throw result.error
  return result
}
