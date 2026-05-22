import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { BookCover } from './BookCover'
import { coverSrc, CATEGORY_COLORS } from '@/lib/utils'
import type { Book } from './BookCard'

const CAT_GRADIENTS: Record<string, string> = {
  儒: 'from-amber-950/90 to-amber-800/70',
  释: 'from-purple-950/90 to-purple-800/70',
  道: 'from-teal-950/90 to-teal-700/70',
  史: 'from-blue-950/90 to-blue-800/70',
  集: 'from-rose-950/90 to-rose-800/70',
  哲: 'from-indigo-950/90 to-indigo-800/70',
  文: 'from-emerald-950/90 to-emerald-800/70',
}

const CAT_BG: Record<string, string> = {
  儒: '#78350f',
  释: '#581c87',
  道: '#134e4a',
  史: '#1e3a5f',
  集: '#881337',
  哲: '#312e81',
  文: '#064e3b',
}

export function BookDetail({ book }: { book: Book }) {
  const src = coverSrc(book.cover_url)
  const gradient = CAT_GRADIENTS[book.category] ?? 'from-stone-950/90 to-stone-800/70'
  const bgColor = CAT_BG[book.category] ?? '#3d2c1e'

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      {/* Hero 区域 */}
      <div className="relative min-h-[300px] flex items-end" style={{ backgroundColor: bgColor }}>
        {/* 背景封面虚化 */}
        {src && (
          <div className="absolute inset-0 overflow-hidden">
            <BookCover src={src} alt="" category={book.category}
              fill className="opacity-25 blur-md scale-110 object-cover" />
          </div>
        )}
        {/* 渐变遮罩 */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />

        {/* 内容层 */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 p-6 sm:p-8 w-full items-end">
          {/* 封面卡片 */}
          <div className="shrink-0 self-start sm:self-auto">
            <div className="w-32 sm:w-44 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl
              ring-2 ring-white/20 relative">
              <BookCover
                src={src}
                alt={book.title}
                category={book.category}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* 文字信息 */}
          <div className="flex-1 min-w-0 text-white pb-1">
            <Badge className={`mb-3 text-xs font-medium ${CATEGORY_COLORS[book.category] ?? ''} border-0`}>
              {book.category}
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight drop-shadow-lg tracking-wide">
              {book.title}
            </h1>
            <p className="text-white/70 text-base mb-4 font-medium">{book.author}</p>
            {book.description && (
              <p className="text-white/60 text-sm leading-relaxed line-clamp-3 max-w-xl">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white border-b border-[--border] px-6 sm:px-8 py-5
        flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {book.file_url ? (
            <Link href={`/books/${book.id}/read`}>
              <button className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl
                bg-[--ink] text-[--paper] text-base font-bold
                hover:bg-[--gold] hover:text-[--ink]
                active:scale-95 transition-all duration-150 shadow-md hover:shadow-xl">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                开始阅读
              </button>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
              bg-gray-100 text-gray-400 text-sm border border-dashed border-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              电子版整理中
            </span>
          )}
        </div>

        <div className="text-xs text-gray-400 text-right space-y-0.5">
          <p className="text-gray-500">{book.view_count.toLocaleString()} 人阅读</p>
          {book.is_public && <p className="text-[--gold] font-medium">✦ 公版经典 · 永久免费</p>}
        </div>
      </div>
    </div>
  )
}
