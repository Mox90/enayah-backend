import { Router } from 'express'
import { db } from './db'
import authRoutes from './modules/auth/auth.routes'
import employeeRoutes from './modules/employees/employees.routes'
import { authenticate } from './middleware/auth.middleware'
import {
  anomalyBurstDetector,
  suspiciousReadDetector,
} from './middleware/anomaly.middleware'
import anomalyRoutes from './modules/anomalies/anomaly.routes'

const router = Router()

router.use('/auth', authRoutes)

router.use(
  '/employees',
  anomalyBurstDetector,
  suspiciousReadDetector,
  employeeRoutes,
)

router.use('/anomalies', anomalyRoutes)

router.get('/secure', authenticate, (req, res) => {
  res.json({ user: req.user })
})

router.get('/', (_req, res) => {
  res.send('Enayah Backend API')
})

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Enayah backend running',
  })
})

router.get('/db-test', async (req, res) => {
  if (process.env.NODE_ENV === 'production')
    return res.status(404).json({ error: 'Not found' })

  try {
    const result = await db.execute('select now()')
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' })
  }
})

router.get('/error-test', (_req, res) => {
  if (process.env.NODE_ENV === 'production')
    return res.status(404).json({ error: 'Not found' })

  throw new Error('Test crash!')
})

router.get('/db-check', async (_req, res) => {
  if (process.env.NODE_ENV === 'production')
    return res.status(404).json({ error: 'Not found' })

  try {
    const usersData = await db.query.users.findMany()
    const deptData = await db.query.departments.findMany()
    const empData = await db.query.employees.findMany()

    res.json({
      users: usersData,
      departments: deptData,
      employees: empData,
    })
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' })
  }
})

export default router
