import Link from 'next/link'
import Image from 'next/image'
import { coverSrc, CATEGORY_COLORS } from '@/lib/utils'

export type Book = {
  id: string
  title: string
  author: string
  category: string
  description: string | null
  cover_url: string | null
  file_url: string | null
  published_at: string | null
  is_public: boolean
  view_count: number
  created_at: string
}

const CAT_BG: Record<string, string> = {
  儒: 'bg-amber-900',
  释: 'bg-purple-900',
  道: 'bg-teal-900',
  史: 'bg-blue-900',
  集: 'bg-rose-900',
  哲: 'bg-indigo-900',
  文: 'bg-emerald-900',
}

export function BookCard({ book }: { book: Book }) {
  const src = coverSrc(book.cover_url)
  const catBg = CAT_BG[book.category] ?? 'bg-stone-800'

  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="bg-white border border-[--border] rounded-xl overflow-hidden
        hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
        {/* 封面 */}
        <div className="aspect-[3/4] overflow-hidden">
          {src ? (
            <Image src={src} alt={book.title} width={200} height={280}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className={`w-full h-full ${catBg} flex flex-col items-center justify-center p-3`}>
              <span className="text-4xl sm:text-5xl font-bold text-white/90 font-serif mb-1">
                {book.title[0]}
              </span>
              <span className="text-[10px] text-white/50 text-center line-clamp-2 leading-tight">
                {book.title}
              </span>
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="p-3">
          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mb-1.5
            ${CATEGORY_COLORS[book.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {book.category}
          </span>
          <h3 className="font-bold text-[--ink] line-clamp-1 text-sm
            group-hover:text-[--gold] transition-colors leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{book.author}</p>
        </div>
      </div>
    </Link>
  )
}
