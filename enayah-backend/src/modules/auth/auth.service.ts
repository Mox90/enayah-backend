import bcrypt from 'bcrypt'
import { eq, sql } from 'drizzle-orm'
import { db, users } from '../../db'
import { AppError } from '../../utils/AppError'
import { generateToken } from './jwt'
import { logger } from '../../config/logger'

export const login = async (username: string, password: string) => {
  const result = db.transaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (!user) throw new AppError('Invalid credentials', 401)

    if (!user.isActive) {
      logger.warn('Login attempt on disabled account!', { username })
      throw new AppError('Invalid credentials', 401)
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      logger.warn('Login attempt on disabled account!', { username })
      throw new AppError('Invalid credentials', 401)
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

        //throw new AppError('Invalid credentials', 401)
        return { error: new AppError('Invalid credentials', 401) }
      }
    } else if (user.authProvider === 'ad') {
      logger.warn('AD login attempted but not configured', { username })
      throw new AppError('Invalid credentials', 401)
    } else {
      logger.error('Unknown auth provider', {
        username,
        provider: user.authProvider,
      })
      throw new AppError('Invalid credentials', 401)
    }

    // ✅ RESET SUCCESS
    await tx
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return {
      token: generateToken({
        id: user.id,
        role: user.role,
        employeeId: user.employeeId,
      }),
    }
  })

  if ('error' in result) throw result.error
  return result
}
