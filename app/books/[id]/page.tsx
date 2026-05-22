import { createClient } from '@/lib/supabase/server'
import { BookDetail } from '@/components/books/BookDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('title,author').eq('id', id).single()
  if (!book) return { title: '书籍未找到' }
  return {
    title: `${book.title} — 儒典书城`,
    description: `在线阅读《${book.title}》，作者：${book.author}`,
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase.from('books').select('*').eq('id', id).single()
  if (!book) notFound()

  // 增加浏览量（ignore error if RPC not ready）
  await Promise.resolve(supabase.rpc('increment_view_count', { book_id: id })).catch(() => {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BookDetail book={book} />
    </div>
  )
}
