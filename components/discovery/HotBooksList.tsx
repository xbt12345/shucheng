import { BookCard, type Book } from '@/components/books/BookCard'

export function HotBooksList({ books, title }: { books: Book[]; title: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[--ink] mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {books.map((book, i) => (
          <div key={book.id} className="relative">
            {i < 3 && (
              <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full
                bg-[--ink] text-[--paper] text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
            )}
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  )
}
