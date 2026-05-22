import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BookCard } from '@/components/books/BookCard'
import { AddToBooklistButton } from '@/components/booklists/AddToBooklistButton'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('booklists').select('title').eq('id', id).single()
  return { title: data ? `${data.title} — 儒典书城` : '书单' }
}

export default async function BooklistDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bl } = await supabase
    .from('booklists')
    .select('*, profiles(id, username)')
    .eq('id', id)
    .single()

  if (!bl) notFound()
  if (!bl.is_public && bl.user_id !== user?.id) notFound()

  const { data: items } = await supabase
    .from('booklist_items')
    .select('book_id, order_num, books(*)')
    .eq('booklist_id', id)
    .order('order_num')

  const books = (items ?? []).map((item: any) => item.books).filter(Boolean)
  const isOwner = user?.id === bl.user_id

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 书单头部 */}
      <div className="bg-white border border-[--border] rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[--ink]">{bl.title}</h1>
              {!bl.is_public && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">私密</span>
              )}
            </div>
            {bl.description && (
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{bl.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
              <span>by <strong className="text-[--ink]">{(bl.profiles as any)?.username}</strong></span>
              <span>·</span>
              <span>{books.length} 本书</span>
              <span>·</span>
              <span>{new Date(bl.created_at).toLocaleDateString('zh-CN')} 创建</span>
            </div>
          </div>
          {isOwner && (
            <Link href={`/booklists/${id}/edit`}
              className="shrink-0 text-sm text-gray-400 hover:text-[--ink] transition-colors">
              编辑
            </Link>
          )}
        </div>
      </div>

      {/* 书籍列表 */}
      {books.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-[--border] rounded-xl">
          <div className="text-4xl mb-3">📭</div>
          <p>书单暂无书籍</p>
          {isOwner && (
            <p className="text-sm mt-1">
              去
              <Link href="/books" className="text-[--gold] hover:underline mx-1">书库</Link>
              浏览书籍，点击「加入书单」
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
