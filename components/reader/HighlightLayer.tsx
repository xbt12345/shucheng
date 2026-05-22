'use client'

import { useEffect, useState, type RefObject } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchChapterHighlights, subscribeToHighlights, type HighlightRow } from '@/lib/supabase/highlights'
import { useReaderStore } from '@/stores/reader'

const colorMap: Record<string, string> = {
  yellow: '#fef08a', red: '#fca5a5', blue: '#93c5fd', green: '#86efac',
}

export function HighlightLayer({
  bookId,
  rendition,
}: {
  bookId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rendition: RefObject<any>
}) {
  const { currentChapterId } = useReaderStore()
  const [highlights, setHighlights] = useState<HighlightRow[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchChapterHighlights(supabase, bookId, currentChapterId).then(data => {
      setHighlights(data)
    })
  }, [bookId, currentChapterId])

  useEffect(() => {
    const channel = subscribeToHighlights(supabase, bookId, newHighlight => {
      setHighlights(prev => [newHighlight, ...prev])
      rendition.current?.annotations.add(
        'highlight', newHighlight.cfi_range, {},
        undefined, 'hl-others',
        { fill: colorMap[newHighlight.color], 'fill-opacity': '0.2' }
      )
    })
    return () => { supabase.removeChannel(channel) }
  }, [bookId])

  useEffect(() => {
    if (!rendition.current || highlights.length === 0) return
    highlights.forEach(h => {
      rendition.current?.annotations.add(
        'highlight', h.cfi_range, {},
        undefined, 'hl-others',
        { fill: colorMap[h.color], 'fill-opacity': '0.2' }
      )
    })
  }, [highlights])

  return null
}
