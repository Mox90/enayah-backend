import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { tnaProcessor } from '../modules/queue/tna.processor'

const connection = new IORedis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT ?? 6379),
})

const worker = new Worker('tna-queue', tnaProcessor, {
  connection,
  concurrency: 5, // 🔥 parallel jobs
})

worker.on('completed', (job) => {
  console.log(`✅ TNA completed for ${job.id}`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ TNA failed for ${job?.id}`, err)
})
