import { describe, it, expect } from 'vitest'
import { calcStreak } from '@/lib/checkin'

describe('calcStreak', () => {
  it('returns 0 for empty logs', () => {
    expect(calcStreak([])).toBe(0)
  })

  it('counts consecutive days', () => {
    const today = new Date()
    const days = [0, 1, 2].map(d => {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      return date.toISOString().split('T')[0]
    })
    expect(calcStreak(days)).toBe(3)
  })

  it('stops at gap', () => {
    const today = new Date()
    const days = [0, 1, 3].map(d => {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      return date.toISOString().split('T')[0]
    })
    expect(calcStreak(days)).toBe(2)
  })
})
