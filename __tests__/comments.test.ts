import { describe, it, expect } from 'vitest'
import { filterContent } from '@/lib/content-filter'

describe('filterContent', () => {
  it('returns clean for normal text', () => {
    expect(filterContent('这本书很好，值得一读')).toEqual({ clean: true, reason: null })
  })

  it('rejects content with blocked keywords', () => {
    const result = filterContent('这个网站真的很垃圾，不如去找个代理')
    expect(result.clean).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('rejects empty content', () => {
    expect(filterContent('')).toEqual({ clean: false, reason: '内容不能为空' })
  })

  it('rejects content over 2000 characters', () => {
    expect(filterContent('a'.repeat(2001))).toEqual({ clean: false, reason: '内容不能超过 2000 字' })
  })
})
