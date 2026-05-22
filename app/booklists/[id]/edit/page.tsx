import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BooklistEditor } from '@/components/booklists/BooklistEditor'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: '编辑书单 — 儒典书城' }

export default async function BooklistEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: bl } = await supabase
    .from('booklists')
    .select('*')
    .eq('id', id)
    .single()

  if (!bl) notFound()
  if (bl.user_id !== user.id) notFound()

  const { data: items } = await supabase
    .from('booklist_items')
    .select('book_id, order_num, books(id, title, author, cover_url)')
    .eq('booklist_id', id)
    .order('order_num')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BooklistEditor
        booklist={bl}
        items={(items ?? []) as any}
      />
    </div>
  )
}
