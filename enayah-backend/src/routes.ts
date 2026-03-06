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
  const result = await db.execute('select now()')
  res.json(result)
})

export default router
