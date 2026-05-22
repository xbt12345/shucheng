import { createClient } from '@/lib/supabase/server'
import { BookDetail } from '@/components/books/BookDetail'
import { CommentList } from '@/components/community/CommentList'
import { AddToBooklistButton } from '@/components/booklists/AddToBooklistButton'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('title,author,description').eq('id', id).single()
  if (!book) return { title: '书籍未找到' }
  return {
    title: `${book.title} — 儒典书城`,
    description: book.description ?? `在线阅读《${book.title}》，作者：${book.author}`,
    openGraph: { title: `《${book.title}》`, description: book.description ?? '' },
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase.from('books').select('*').eq('id', id).single()
  if (!book) notFound()

  await Promise.resolve(supabase.rpc('increment_view_count', { book_id: id })).catch(() => {})

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 书籍详情 Hero */}
      <BookDetail book={book} />

      {/* 操作按钮行（加入书单） */}
      {user && (
        <div className="flex justify-end">
          <AddToBooklistButton bookId={id} />
        </div>
      )}

      {/* 书评区 */}
      <CommentList bookId={id} />
    </div>
  )
}
