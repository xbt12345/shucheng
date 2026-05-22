'use client'

import { useState } from 'react'

type Tab = '阅读记录' | '我的标注' | '我的书评'

type ReadingLog = {
  id: string
  book_id: string
  logged_at: string
  books: { title: string; author: string; cover_url: string | null } | null
}

type Highlight = {
  id: string
  text: string
  note: string | null
  color: string
  created_at: string
  books: { title: string; author: string } | null
}

type Review = {
  id: string
  content: string
  rating: number | null
  created_at: string
  books: { title: string; author: string; cover_url: string | null } | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

const COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-200',
  red: 'bg-red-200',
  blue: 'bg-blue-200',
  green: 'bg-green-200',
}

function coverUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/covers/${path}`
}

function ReadingHistoryTab({ logs }: { logs: ReadingLog[] }) {
  if (logs.length === 0)
    return <p className="text-center text-gray-400 py-12">暂无阅读记录</p>

  // deduplicate by book_id, keep latest
  const seen = new Set<string>()
  const unique = logs.filter(l => {
    if (seen.has(l.book_id)) return false
    seen.add(l.book_id)
    return true
  })

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {unique.map(log => {
        const book = log.books
        const url = coverUrl(book?.cover_url)
        return (
          <a key={log.book_id} href={`/books/${log.book_id}`}
            className="group flex flex-col rounded-lg overflow-hidden border border-[--border]
              hover:shadow-md transition-shadow bg-white">
            <div className="aspect-[3/4] bg-[--paper-dark] overflow-hidden">
              {url
                ? <img src={url} alt={book?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                : <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
              }
            </div>
            <div className="p-2">
              <p className="text-sm font-medium text-[--ink] line-clamp-1">{book?.title ?? '未知'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{book?.author}</p>
              <p className="text-xs text-gray-300 mt-1">{log.logged_at}</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}

function HighlightsTab({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0)
    return <p className="text-center text-gray-400 py-12">暂无标注</p>

  return (
    <div className="space-y-3">
      {highlights.map(h => (
        <div key={h.id} className="bg-white border border-[--border] rounded-lg p-4">
          <div className={`text-sm text-[--ink] leading-relaxed px-3 py-2 rounded
            ${COLOR_MAP[h.color] ?? 'bg-yellow-200'}`}>
            "{h.text}"
          </div>
          {h.note && (
            <p className="text-sm text-gray-600 mt-2 pl-1">💬 {h.note}</p>
          )}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>《{h.books?.title ?? '未知书籍'}》 · {h.books?.author}</span>
            <span>{new Date(h.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0)
    return <p className="text-center text-gray-400 py-12">暂无书评</p>

  return (
    <div className="space-y-4">
      {reviews.map(r => {
        const book = r.books
        const url = coverUrl(book?.cover_url)
        return (
          <div key={r.id} className="bg-white border border-[--border] rounded-lg p-4 flex gap-4">
            <a href={`/books/${(r as any).book_id}`} className="shrink-0">
              <div className="w-12 h-16 rounded overflow-hidden bg-[--paper-dark]">
                {url
                  ? <img src={url} alt={book?.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">📖</div>
                }
              </div>
            </a>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <a href={`/books/${(r as any).book_id}`}
                  className="text-sm font-medium text-[--ink] hover:underline">
                  《{book?.title ?? '未知'}》
                </a>
                {r.rating && (
                  <span className="text-xs text-[--gold]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-1 line-clamp-3">{r.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

type Props = {
  logs: ReadingLog[]
  highlights: Highlight[]
  reviews: Review[]
}

export function ProfileTabs({ logs, highlights, reviews }: Props) {
  const [active, setActive] = useState<Tab>('阅读记录')

  const tabs: { key: Tab; count: number }[] = [
    { key: '阅读记录', count: new Set(logs.map(l => l.book_id)).size },
    { key: '我的标注', count: highlights.length },
    { key: '我的书评', count: reviews.length },
  ]

  return (
    <div>
      <div className="flex border-b border-[--border] mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors
              ${active === t.key
                ? 'border-b-2 border-[--ink] text-[--ink]'
                : 'text-gray-400 hover:text-gray-600'}`}>
            {t.key}
            <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>
          </button>
        ))}
      </div>

      {active === '阅读记录' && <ReadingHistoryTab logs={logs} />}
      {active === '我的标注' && <HighlightsTab highlights={highlights} />}
      {active === '我的书评' && <ReviewsTab reviews={reviews} />}
    </div>
  )
}
