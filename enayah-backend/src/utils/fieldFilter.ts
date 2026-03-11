/*export const filterFields = (
  data: unknown,
  allowed: string[] | '*',
): unknown => {
  if (allowed === '*') return data

  if (Array.isArray(data)) {
    return data.map((item) => filterFields(item, allowed))
  }

  if (typeof data !== 'object' || data === null) {
    return data
  }

  const filtered: Record<string, unknown> = {}

  for (const key of allowed) {
    if (key in data) {
      filtered[key] = (data as Record<string, unknown>)[key]
    }
  }

  return filtered
}*/
export const filterFields = (
  data: any,
  allowed: readonly string[] | '*',
): any => {
  if (allowed === '*') return data

  if (Array.isArray(data)) {
    return data.map((item) => filterFields(item, allowed))
  }

  const filtered: any = {}

  for (const key of allowed) {
    if (key in data) filtered[key] = data[key]
  }

  return filtered
}
