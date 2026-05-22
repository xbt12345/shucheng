import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Book } from './BookCard'

const categoryColors: Record<string, string> = {
  儒: 'bg-amber-100 text-amber-800',
  释: 'bg-purple-100 text-purple-800',
  道: 'bg-teal-100 text-teal-800',
  史: 'bg-blue-100 text-blue-800',
  集: 'bg-rose-100 text-rose-800',
}

export function BookDetail({ book }: { book: Book }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-shrink-0">
        <div className="w-40 h-56 bg-[--paper-dark] rounded-lg overflow-hidden flex
          items-center justify-center">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title}
              width={160} height={224} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <div className="text-5xl mb-2">📖</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <Badge className={`mb-2 ${categoryColors[book.category] ?? ''}`}>
          {book.category}
        </Badge>
        <h1 className="text-3xl font-bold text-[--ink] mb-1">{book.title}</h1>
        <p className="text-gray-600 mb-4">{book.author}</p>
        {book.description && (
          <p className="text-gray-700 leading-relaxed mb-6">{book.description}</p>
        )}
        <div className="flex gap-3">
          {book.file_url ? (
            <Link href={`/books/${book.id}/read`}>
              <Button className="bg-[--ink] text-[--paper] hover:bg-[--gold] hover:text-[--ink]">
                开始阅读
              </Button>
            </Link>
          ) : (
            <Button disabled>暂无电子版</Button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          已有 {book.view_count} 人阅读
          {book.is_public && ' · 公版经典，永久免费'}
        </p>
      </div>
    </div>
  )
}
