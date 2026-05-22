import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Metadata } from 'next'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
function coverSrc(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/covers/${path}`
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('circles').select('name').eq('id', id).single()
  return { title: data ? `${data.name} — 儒典书城` : '话题圈' }
}

export default async function CircleDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: circle } = await supabase
    .from('circles')
    .select('*, profiles(username, avatar_url), books(id, title, author, cover_url)')
    .eq('id', id)
    .single()

  if (!circle) notFound()

  // 取关联书的评论作为圈内讨论
  const { data: discussions } = circle.book_id
    ? await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('book_id', circle.book_id)
        .is('parent_id', null)
        .is('highlight_id', null)
        .order('created_at', { ascending: false })
        .limit(30)
    : { data: [] }

  const book = circle.books as any
  const owner = circle.profiles as any
  const bookCover = coverSrc(book?.cover_url)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* 圈子头部 */}
      <div className="bg-white border border-[--border] rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-amber-50 to-orange-100 relative flex items-center justify-center">
          {bookCover && (
            <img src={bookCover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <span className="relative text-6xl">🏮</span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[--ink]">{circle.name}</h1>
              {circle.description && (
                <p className="text-gray-600 text-sm mt-1">{circle.description}</p>
              )}
            </div>
            <div className="text-center shrink-0">
              <div className="text-2xl font-bold text-[--ink]">{circle.member_count}</div>
              <div className="text-xs text-gray-400">成员</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
            <Avatar className="w-5 h-5">
              <AvatarImage src={owner?.avatar_url} />
              <AvatarFallback className="text-[8px]">{owner?.username?.[0]}</AvatarFallback>
            </Avatar>
            <span>由 <strong className="text-[--ink]">{owner?.username}</strong> 创建</span>
          </div>

          {book && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-[--paper-dark] rounded-lg">
              <div className="w-8 h-10 rounded overflow-hidden bg-gray-200 shrink-0">
                {bookCover
                  ? <img src={bookCover} alt={book.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                }
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">关联书籍</p>
                <Link href={`/books/${book.id}`}
                  className="text-sm font-medium text-[--ink] hover:text-[--gold] transition-colors line-clamp-1">
                  《{book.title}》
                </Link>
                <p className="text-xs text-gray-400">{book.author}</p>
              </div>
              <Link href={`/books/${book.id}`}
                className="ml-auto shrink-0 text-xs text-[--gold] hover:underline">
                去阅读 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 讨论区 */}
      <div>
        <h2 className="text-base font-bold text-[--ink] mb-4">
          圈内讨论
          {book && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              · 来自《{book.title}》书评
            </span>
          )}
        </h2>

        {!book ? (
          <div className="text-center py-12 text-gray-400 bg-white border border-[--border] rounded-xl">
            <p>此圈未关联书籍，暂无讨论内容</p>
          </div>
        ) : (discussions ?? []).length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white border border-[--border] rounded-xl">
            <p>暂无讨论，</p>
            <Link href={`/books/${book.id}`} className="text-[--gold] hover:underline">
              去书籍页面写第一篇书评
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(discussions ?? []).map((c: any) => (
              <div key={c.id} className="bg-white border border-[--border] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={c.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">{c.profiles?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-[--ink]">{c.profiles?.username}</span>
                  {c.rating && (
                    <span className="text-xs text-[--gold] ml-1">
                      {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(c.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {book && (
          <div className="mt-4 text-center">
            <Link href={`/books/${book.id}`}
              className="text-sm text-[--gold] hover:underline">
              参与讨论，前往书籍页面 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
