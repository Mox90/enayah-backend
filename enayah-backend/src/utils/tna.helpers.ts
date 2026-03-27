export const getPriorityFromHorizon = (
  horizon: 'short_term' | 'mid_term' | 'long_term',
): 'high' | 'medium' | 'low' => {
  if (horizon === 'short_term') return 'high'
  if (horizon === 'mid_term') return 'medium'
  return 'low'
}

export const getHorizonFromRating = (
  rating: number,
): 'short_term' | 'mid_term' | 'long_term' => {
  if (rating <= 2) return 'short_term'
  if (rating === 3) return 'mid_term'
  return 'long_term'
}

export const getDueDate = (horizon: string) => {
  const now = Date.now()

  if (horizon === 'short_term') {
    return new Date(now + 90 * 24 * 60 * 60 * 1000)
  }

  if (horizon === 'mid_term') {
    return new Date(now + 180 * 24 * 60 * 60 * 1000)
  }

  return new Date(now + 365 * 24 * 60 * 60 * 1000)
}
