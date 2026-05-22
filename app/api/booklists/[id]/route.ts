import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Props = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  // 确认拥有者
  const { data: bl } = await supabase.from('booklists').select('user_id').eq('id', id).single()
  if (!bl || bl.user_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, is_public } = body as {
    title?: string
    description?: string | null
    is_public?: boolean
  }

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: '书单名称不能为空' }, { status: 400 })
  }

  const { error } = await supabase
    .from('booklists')
    .update({ title: title.trim(), description: description ?? null, is_public: is_public ?? true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { data: bl } = await supabase.from('booklists').select('user_id').eq('id', id).single()
  if (!bl || bl.user_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  const { error } = await supabase.from('booklists').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
