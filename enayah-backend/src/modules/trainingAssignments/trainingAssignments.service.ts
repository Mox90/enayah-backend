import { trainingAssignments } from '../../db'

export const assignTraining = async (tx, data) => {
  return tx.insert(trainingAssignments).values(data)
}
