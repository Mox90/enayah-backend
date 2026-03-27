import { auditLogs } from '../../db/schema'

export const logFieldChange = async (
  tx: any,
  {
    tableName,
    recordId,
    fieldName,
    oldValue,
    newValue,
    action,
    performedBy,
  }: {
    tableName: string
    recordId: string
    fieldName: string
    oldValue?: any
    newValue?: any
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    performedBy?: string
  },
) => {
  await tx.insert(auditLogs).values({
    tableName,
    recordId,
    fieldName,
    oldValue,
    newValue,
    action,
    performedBy,
  })
}
