import { createClient } from '@/lib/supabase/server'
import { BookCard } from '@/components/books/BookCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = { title: '发现 — 儒典书城' }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function coverSrc(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/covers/${path}`
}

const categoryColors: Record<string, string> = {
  儒: 'bg-amber-100 text-amber-800',
  释: 'bg-purple-100 text-purple-800',
  道: 'bg-teal-100 text-teal-800',
  史: 'bg-blue-100 text-blue-800',
  集: 'bg-rose-100 text-rose-800',
}

export default async function DiscoverPage() {
  const supabase = await createClient()

  const [
    { data: hotBooks },
    { data: recentBooks },
    { data: booklists },
    { data: topHighlights },
    { data: categoryStats },
  ] = await Promise.all([
    // 热读榜：按阅读量排
    supabase.from('books').select('*').order('view_count', { ascending: false }).limit(10),
    // 最新入库
    supabase.from('books').select('*').order('created_at', { ascending: false }).limit(8),
    // 公开书单（含书籍数量）
    supabase.from('booklists')
      .select('*, profiles(username), booklist_items(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6),
    // 热门标注
    supabase.from('highlights')
      .select('id, text, color, note, books(title, id), profiles(username)')
      .eq('visibility', 'public')
      .order('like_count', { ascending: false })
      .limit(5),
    // 各分类书籍数量
    supabase.from('books').select('category'),
  ])

  // 统计各分类数量
  const catCount: Record<string, number> = {}
  for (const b of categoryStats ?? []) {
    catCount[b.category] = (catCount[b.category] ?? 0) + 1
  }

  const colorMap: Record<string, string> = {
    yellow: 'border-l-yellow-400 bg-yellow-50',
    red: 'border-l-red-400 bg-red-50',
    blue: 'border-l-blue-400 bg-blue-50',
    green: 'border-l-green-400 bg-green-50',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-14">

      {/* 分类导航 */}
      <section>
        <h2 className="text-lg font-bold text-[--ink] mb-4">浏览分类</h2>
        <div className="flex flex-wrap gap-3">
          {['儒', '释', '道', '史', '集'].map(cat => (
            <Link key={cat} href={`/books?category=${cat}`}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all
                hover:scale-105 hover:shadow-sm ${categoryColors[cat]}`}>
              {cat} · {catCount[cat] ?? 0} 部
            </Link>
          ))}
          <Link href="/books" className="px-5 py-2.5 rounded-full text-sm font-medium
            bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            全部书库 →
          </Link>
        </div>
      </section>

      {/* 热读榜 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[--ink]">热读榜</h2>
          <Link href="/books" className="text-sm text-gray-400 hover:text-[--gold]">查看全部</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {(hotBooks ?? []).slice(0, 5).map((book, i) => (
            <Link key={book.id} href={`/books/${book.id}`}
              className="shrink-0 w-28 group">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[--paper-dark]">
                {coverSrc(book.cover_url)
                  ? <img src={coverSrc(book.cover_url)!} alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                }
                <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-[--ink]
                  text-[--paper] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <p className="text-xs font-medium text-[--ink] mt-1.5 line-clamp-1">{book.title}</p>
              <p className="text-[10px] text-gray-400">{book.view_count} 次阅读</p>
            </Link>
          ))}
          <div className="shrink-0 grid grid-cols-1 gap-2 w-56">
            {(hotBooks ?? []).slice(5).map((book, i) => (
              <Link key={book.id} href={`/books/${book.id}`}
                className="flex items-center gap-2 group">
                <span className="w-5 h-5 shrink-0 text-center text-xs font-bold text-gray-400">
                  {i + 6}
                </span>
                <div className="w-8 h-10 shrink-0 rounded overflow-hidden bg-[--paper-dark]">
                  {coverSrc(book.cover_url)
                    ? <img src={coverSrc(book.cover_url)!} alt={book.title}
                        className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[--ink] line-clamp-1
                    group-hover:text-[--gold] transition-colors">{book.title}</p>
                  <p className="text-[10px] text-gray-400">{book.view_count} 次</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 热门标注 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[--ink]">热门标注</h2>
          <Link href="/community/highlights" className="text-sm text-gray-400 hover:text-[--gold]">
            查看全部
          </Link>
        </div>
        {(topHighlights ?? []).length === 0
          ? <p className="text-gray-400 text-sm">暂无公开标注</p>
          : (
            <div className="space-y-3">
              {(topHighlights ?? []).map((h: any) => (
                <Link key={h.id} href={`/books/${h.books?.id}`}
                  className={`block border-l-4 pl-4 py-3 pr-4 rounded-r-lg transition-opacity hover:opacity-80
                    ${colorMap[h.color] ?? 'border-l-gray-300 bg-gray-50'}`}>
                  <p className="text-sm text-[--ink] leading-relaxed line-clamp-2">"{h.text}"</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <span>{h.profiles?.username}</span>
                    <span>·</span>
                    <span>《{h.books?.title}》</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </section>

      {/* 热门书单 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[--ink]">精选书单</h2>
        </div>
        {(booklists ?? []).length === 0
          ? <p className="text-gray-400 text-sm">暂无公开书单</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(booklists ?? []).map((bl: any) => (
                <div key={bl.id}
                  className="bg-white border border-[--border] rounded-xl p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-[--ink] line-clamp-1">{bl.title}</h3>
                  {bl.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bl.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>by {bl.profiles?.username}</span>
                    <span>{bl.booklist_items?.[0]?.count ?? 0} 本书</span>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </section>

      {/* 最新入库 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[--ink]">最新入库</h2>
          <Link href="/books" className="text-sm text-gray-400 hover:text-[--gold]">查看全部</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(recentBooks ?? []).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

    </div>
  )
}
