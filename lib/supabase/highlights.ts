import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green'
export type HighlightVisibility = 'public' | 'friends' | 'private'

export type HighlightInsertInput = {
  userId: string
  bookId: string
  chapterId: string | null
  cfiRange: string
  text: string
  color: HighlightColor
  note: string
  visibility: HighlightVisibility
}

export type HighlightRow = {
  id: string
  user_id: string
  book_id: string
  chapter_id: string | null
  cfi_range: string
  text: string
  color: HighlightColor
  note: string | null
  visibility: HighlightVisibility
  like_count: number
  created_at: string
}

export function buildHighlightInsert(input: HighlightInsertInput) {
  return {
    user_id: input.userId,
    book_id: input.bookId,
    chapter_id: input.chapterId,
    cfi_range: input.cfiRange,
    text: input.text,
    color: input.color,
    note: input.note.trim() || null,
    visibility: input.visibility,
  }
}

export async function insertHighlight(
  supabase: SupabaseClient,
  input: HighlightInsertInput
): Promise<HighlightRow | null> {
  const { data, error } = await supabase
    .from('highlights')
    .insert(buildHighlightInsert(input))
    .select()
    .single()
  if (error) { console.error('insertHighlight error:', error); return null }
  return data
}

export async function fetchChapterHighlights(
  supabase: SupabaseClient,
  bookId: string,
  chapterId: string | null
): Promise<HighlightRow[]> {
  let query = supabase
    .from('highlights')
    .select('*')
    .eq('book_id', bookId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (chapterId) query = query.eq('chapter_id', chapterId)

  const { data } = await query
  return data ?? []
}

export function subscribeToHighlights(
  supabase: SupabaseClient,
  bookId: string,
  onInsert: (highlight: HighlightRow) => void
): RealtimeChannel {
  return supabase
    .channel(`highlights:${bookId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'highlights',
      filter: `book_id=eq.${bookId}`,
    }, payload => {
      const h = payload.new as HighlightRow
      if (h.visibility === 'public') onInsert(h)
    })
    .subscribe()
}
