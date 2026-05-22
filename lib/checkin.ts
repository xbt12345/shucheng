/** dates: ISO date strings, any order */
export function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().split('T')[0]

  const latestDate = sorted[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (latestDate !== today && latestDate !== yesterdayStr) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (Math.round(diff) === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export const BADGES = [
  { days: 7,   name: '初心者', emoji: '🌱' },
  { days: 30,  name: '月读者', emoji: '🌿' },
  { days: 100, name: '百日功', emoji: '🎋' },
  { days: 365, name: '经年学者', emoji: '🏆' },
]

export function getEarnedBadges(streak: number) {
  return BADGES.filter(b => streak >= b.days)
}
