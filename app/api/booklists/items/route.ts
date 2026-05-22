import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { booklistId, bookId } = await req.json() as { booklistId?: string; bookId?: string }
  if (!booklistId || !bookId) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 })
  }

  // 确认是书单拥有者
  const { data: bl } = await supabase
    .from('booklists')
    .select('user_id')
    .eq('id', booklistId)
    .single()

  if (!bl || bl.user_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  // 获取当前最大 order_num
  const { data: maxItem } = await supabase
    .from('booklist_items')
    .select('order_num')
    .eq('booklist_id', booklistId)
    .order('order_num', { ascending: false })
    .limit(1)
    .single()

  const orderNum = (maxItem?.order_num ?? 0) + 1

  const { error } = await supabase
    .from('booklist_items')
    .upsert({ booklist_id: booklistId, book_id: bookId, order_num: orderNum })

  if (error) {
    const msg = error.code === '23505' ? '该书已在书单中' : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
