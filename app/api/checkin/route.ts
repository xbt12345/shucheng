import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { bookId, progressCfi, durationSec } = await request.json()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase.from('reading_logs')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      progress_cfi: progressCfi,
      duration_sec: durationSec,
      logged_at: today,
    }, { onConflict: 'user_id,book_id,logged_at', ignoreDuplicates: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const supabase = await createClient()
  const { data } = await supabase
    .from('reading_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(400)

  const dates = (data ?? []).map((r: { logged_at: string }) => r.logged_at)
  return NextResponse.json({ dates })
}
