import Link from 'next/link'
import { BookCover } from './BookCover'
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

export function BookCard({ book }: { book: Book }) {
  const src = coverSrc(book.cover_url)

  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="bg-white border border-[--border] rounded-xl overflow-hidden
        hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
        {/* 封面 */}
        <div className="aspect-[3/4] relative overflow-hidden">
          <BookCover
            src={src}
            alt={book.title}
            category={book.category}
            fill
            className="group-hover:scale-105 transition-transform duration-300"
          />
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
