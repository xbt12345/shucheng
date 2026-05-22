import { createClient } from '@/lib/supabase/server'
import { BookGrid } from '@/components/books/BookGrid'
import { CategoryTabs } from '@/components/books/CategoryTabs'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '书库 — 儒典书城',
  description: '浏览儒释道与中国传统文化经典书库',
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('books').select('*').order('view_count', { ascending: false })

  if (category && category !== '全部') {
    query = query.eq('category', category)
  }
  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`)
  }

  const { data: books } = await query.limit(50)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[--ink]">书库</h1>
      </div>
      <Suspense>
        <CategoryTabs />
      </Suspense>
      <div className="mt-6">
        <BookGrid books={books ?? []} />
      </div>
    </div>
  )
}
