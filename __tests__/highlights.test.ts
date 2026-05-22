import { describe, it, expect } from 'vitest'
import { buildHighlightInsert } from '@/lib/supabase/highlights'

describe('buildHighlightInsert', () => {
  it('returns correct insert payload', () => {
    const payload = buildHighlightInsert({
      userId: 'user-1',
      bookId: 'book-1',
      chapterId: 'ch-1',
      cfiRange: 'epubcfi(/6/4!/1:10,/1:20)',
      text: '道可道',
      color: 'yellow',
      note: '',
      visibility: 'public',
    })
    expect(payload.user_id).toBe('user-1')
    expect(payload.text).toBe('道可道')
    expect(payload.color).toBe('yellow')
    expect(payload.visibility).toBe('public')
    expect(payload.note).toBeNull()
  })

  it('sets note to null when empty string', () => {
    const payload = buildHighlightInsert({
      userId: 'u', bookId: 'b', chapterId: 'c',
      cfiRange: 'cfi', text: '文', color: 'red',
      note: '', visibility: 'private',
    })
    expect(payload.note).toBeNull()
  })
})
