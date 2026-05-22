import { createClient } from '@/lib/supabase/server'
import { filterContent } from '@/lib/content-filter'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const body = await request.json()
  const { bookId, highlightId, parentId, content, rating } = body

  const filter = filterContent(content)
  if (!filter.clean) {
    return NextResponse.json({ error: filter.reason }, { status: 400 })
  }

  const { data, error } = await supabase.from('comments').insert({
    user_id: user.id,
    book_id: bookId,
    highlight_id: highlightId ?? null,
    parent_id: parentId ?? null,
    content,
    rating: rating ?? null,
  }).select('*, profiles(username, avatar_url)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')
  const highlightId = searchParams.get('highlightId')

  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 })

  const supabase = await createClient()
  let query = supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('book_id', bookId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (highlightId) {
    query = query.eq('highlight_id', highlightId)
  } else {
    query = query.is('highlight_id', null)
  }

  const { data } = await query
  return NextResponse.json(data ?? [])
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('id')
  if (!commentId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { error } = await supabase.from('comments')
    .delete().eq('id', commentId).eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
