import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { followingId } = await request.json()
  if (followingId === user.id) {
    return NextResponse.json({ error: '不能关注自己' }, { status: 400 })
  }

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error?.code === '23505') {
    return NextResponse.json({ error: '已关注' }, { status: 409 })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const followingId = searchParams.get('followingId')
  if (!followingId) return NextResponse.json({ error: 'followingId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  await supabase.from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  return NextResponse.json({ success: true })
}
