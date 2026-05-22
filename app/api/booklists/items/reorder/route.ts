import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { booklistId, order } = await req.json() as {
    booklistId?: string
    order?: Array<{ bookId: string; orderNum: number }>
  }

  if (!booklistId || !order) return NextResponse.json({ error: '参数缺失' }, { status: 400 })

  const { data: bl } = await supabase.from('booklists').select('user_id').eq('id', booklistId).single()
  if (!bl || bl.user_id !== user.id) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  // 批量更新排序（逐条 upsert）
  const updates = order.map(({ bookId, orderNum }) =>
    supabase
      .from('booklist_items')
      .update({ order_num: orderNum })
      .eq('booklist_id', booklistId)
      .eq('book_id', bookId)
  )

  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}
