import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { coverSrc, CATEGORY_COLORS } from '@/lib/utils'
import type { Book } from './BookCard'

const CAT_GRADIENTS: Record<string, string> = {
  儒: 'from-amber-900/80 to-amber-700/60',
  释: 'from-purple-900/80 to-purple-700/60',
  道: 'from-teal-900/80 to-teal-600/60',
  史: 'from-blue-900/80 to-blue-700/60',
  集: 'from-rose-900/80 to-rose-700/60',
  哲: 'from-indigo-900/80 to-indigo-700/60',
  文: 'from-emerald-900/80 to-emerald-700/60',
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
  const gradient = CAT_GRADIENTS[book.category] ?? 'from-stone-900/80 to-stone-700/60'
  const bgColor = CAT_BG[book.category] ?? '#3d2c1e'

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      {/* Hero 区域 */}
      <div
        className="relative min-h-[280px] flex items-end"
        style={{ backgroundColor: bgColor }}
      >
        {/* 背景封面模糊 */}
        {src && (
          <div className="absolute inset-0 overflow-hidden">
            <Image src={src} alt="" fill className="object-cover opacity-20 blur-sm scale-110" />
          </div>
        )}
        {/* 渐变遮罩 */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />

        {/* 内容 */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 p-6 sm:p-8 w-full items-end">
          {/* 封面 */}
          <div className="shrink-0 self-start sm:self-auto">
            <div className="w-32 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl
              ring-2 ring-white/20 bg-white/10">
              {src ? (
                <Image src={src} alt={book.title} width={160} height={213}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-3">
                  <span className="text-5xl font-bold mb-1 font-serif">
                    {book.title[0]}
                  </span>
                  <span className="text-xs text-center opacity-70 line-clamp-2">{book.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* 书目信息 */}
          <div className="flex-1 min-w-0 text-white pb-1">
            <Badge className={`mb-3 text-xs ${CATEGORY_COLORS[book.category] ?? ''} border-0`}>
              {book.category}
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 leading-tight drop-shadow">
              {book.title}
            </h1>
            <p className="text-white/70 text-base mb-4">{book.author}</p>
            {book.description && (
              <p className="text-white/60 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl">
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
              <button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl
                bg-[--ink] text-[--paper] text-base font-bold
                hover:bg-[--gold] hover:text-[--ink]
                active:scale-95 transition-all duration-150 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                开始阅读
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-gray-100 text-gray-400 text-sm border border-gray-200 cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                电子版即将上线
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 text-right space-y-0.5">
          <p>{book.view_count.toLocaleString()} 人阅读</p>
          {book.is_public && <p className="text-[--gold]">✦ 公版经典 · 永久免费</p>}
        </div>
      </div>
    </div>
  )
}
