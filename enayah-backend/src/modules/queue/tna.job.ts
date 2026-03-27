import { tnaQueue } from './queue'

export const enqueueTNAJob = async (data: { appraisalId: string }) => {
  await tnaQueue.add('generate-tna', data, {
    jobId: `tna-${data.appraisalId}`,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  })
}
