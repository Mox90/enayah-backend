export const getChangedFields = (
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
) => {
  const changes: {
    field: string
    oldValue: any
    newValue: any
  }[] = []

  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

  for (const key of keys) {
    if (oldObj[key] !== newObj[key]) {
      changes.push({
        field: key,
        oldValue: oldObj[key],
        newValue: newObj[key],
      })
    }
  }

  return changes
}
