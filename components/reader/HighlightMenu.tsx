'use client'

import { useState, type RefObject } from 'react'
import { useReaderStore } from '@/stores/reader'
import { createClient } from '@/lib/supabase/client'
import { insertHighlight, type HighlightColor } from '@/lib/supabase/highlights'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const COLORS: { value: HighlightColor; label: string; bg: string }[] = [
  { value: 'yellow', label: '黄', bg: 'bg-yellow-200' },
  { value: 'red',    label: '红', bg: 'bg-red-200' },
  { value: 'blue',   label: '蓝', bg: 'bg-blue-200' },
  { value: 'green',  label: '绿', bg: 'bg-green-200' },
]

const colorMap: Record<HighlightColor, string> = {
  yellow: '#fef08a', red: '#fca5a5', blue: '#93c5fd', green: '#86efac',
}

export function HighlightMenu({
  bookId,
  rendition,
}: {
  bookId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rendition: RefObject<any>
}) {
  const { showHighlightMenu, selectedCfi, selectedText, currentChapterId, closeHighlightMenu } =
    useReaderStore()
  const [color, setColor] = useState<HighlightColor>('yellow')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  if (!showHighlightMenu || !selectedCfi) return null

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('请先登录'); return }

    setSaving(true)

    // Optimistic render on epub
    rendition.current?.annotations.add(
      'highlight', selectedCfi, {},
      undefined, 'hl',
      { fill: colorMap[color], 'fill-opacity': '0.4' }
    )

    const result = await insertHighlight(supabase, {
      userId: user.id,
      bookId,
      chapterId: currentChapterId,
      cfiRange: selectedCfi,
      text: selectedText ?? '',
      color,
      note,
      visibility: 'public',
    })

    if (result) {
      toast.success('标注已保存')
    } else {
      toast.error('保存失败，请重试')
    }

    setNote('')
    setSaving(false)
    closeHighlightMenu()
  }

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50
      bg-white border border-[--border] rounded-xl shadow-lg p-4 w-72">
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">「{selectedText}」</p>
      <div className="flex gap-2 mb-3">
        {COLORS.map(c => (
          <button key={c.value}
            onClick={() => setColor(c.value)}
            className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center
              transition-transform ${color === c.value ? 'scale-125 ring-2 ring-offset-1 ring-[--ink]' : ''}`}>
            <span className="text-xs">{c.label}</span>
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="添加批注（可选）"
        className="w-full h-16 text-sm border border-[--border] rounded-lg p-2
          resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
      />
      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={closeHighlightMenu}>
          取消
        </Button>
        <Button size="sm" className="flex-1 bg-[--ink] text-[--paper]"
          onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存标注'}
        </Button>
      </div>
    </div>
  )
}
