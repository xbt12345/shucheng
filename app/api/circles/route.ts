import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json()
  const { name, description } = body as { name?: string; description?: string | null }

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: '圈子名称不能为空' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('circles')
    .insert({
      name: name.trim(),
      description: description ?? null,
      owner_id: user.id,
      member_count: 1,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}
