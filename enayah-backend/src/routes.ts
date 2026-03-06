import { Router } from 'express'
import { db } from './db'

const router = Router()

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

router.get('/error-test', () => {
  throw new Error('Test crash!')
})

export default router
