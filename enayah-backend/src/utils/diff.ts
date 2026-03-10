const ignoreFields = ['updatedAt', 'createdAt', 'version']

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
    if (ignoreFields.includes(key)) continue

    if (!areEqual(oldObj[key], newObj[key])) {
      changes.push({
        field: key,
        oldValue: oldObj[key],
        newValue: newObj[key],
      })
    }
  }

  return changes
}

export const areEqual = (a: unknown, b: unknown): boolean => {
  // ✅ Date compare
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // ✅ null + undefined handling
  if (a == null && b == null) return true

  // ✅ primitives + NaN-safe compare
  return Object.is(a, b)
}
