import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json()
  const { title, description, is_public } = body as {
    title?: string
    description?: string | null
    is_public?: boolean
  }

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: '书单名称不能为空' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('booklists')
    .insert({
      title: title.trim(),
      description: description ?? null,
      is_public: is_public ?? true,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}
