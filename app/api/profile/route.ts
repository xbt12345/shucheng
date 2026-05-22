import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json()
  const { username, bio } = body as { username?: string; bio?: string | null }

  if (!username || username.trim().length === 0) {
    return NextResponse.json({ error: '用户名不能为空' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: username.trim(), bio: bio ?? null })
    .eq('id', user.id)

  if (error) {
    const msg = error.code === '23505' ? '用户名已被占用' : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
