import { createClient } from '@/lib/supabase/server'
import { HotBooksList } from '@/components/discovery/HotBooksList'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: '社区广场 — 儒典书城',
}

export default async function CommunityPage() {
  const supabase = await createClient()

  const { data: hotBooks } = await supabase
    .from('books')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(8)

  const { data: topRated } = await supabase
    .from('books')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(8)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <HotBooksList books={hotBooks ?? []} title="🔥 热门阅读" />
      <HotBooksList books={topRated ?? []} title="⭐ 精选经典" />
    </div>
  )
}
