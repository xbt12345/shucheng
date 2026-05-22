import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
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
      <div className="bg-white border border-[--border] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-[3/4] bg-[--paper-dark] flex items-center justify-center overflow-hidden">
          {src ? (
            <Image src={src} alt={book.title} width={200} height={280}
              className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <div className="text-5xl">📖</div>
            </div>
          )}
        </div>
        <div className="p-3">
          <Badge className={`text-xs mb-1 ${CATEGORY_COLORS[book.category] ?? ''}`}>
            {book.category}
          </Badge>
          <h3 className="font-medium text-[--ink] line-clamp-1 group-hover:text-[--gold] transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
        </div>
      </div>
    </Link>
  )
}
