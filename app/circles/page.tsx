import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CreateCircleButton } from '@/components/circles/CreateCircleButton'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = { title: '话题圈 — 儒典书城' }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
function coverSrc(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/covers/${path}`
}

export default async function CirclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: circles } = await supabase
    .from('circles')
    .select('*, profiles(username), books(title, cover_url)')
    .order('member_count', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[--ink]">话题圈</h1>
          <p className="text-sm text-gray-500 mt-1">围绕经典，共同探讨</p>
        </div>
        {user && <CreateCircleButton />}
      </div>

      {(circles ?? []).length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">🏮</div>
          <p className="text-lg">暂无话题圈</p>
          <p className="text-sm mt-1">成为第一个创建话题圈的读者</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {(circles ?? []).map((c: any) => {
            const url = coverSrc(c.books?.cover_url)
            return (
              <Link key={c.id} href={`/circles/${c.id}`}
                className="group bg-white border border-[--border] rounded-xl overflow-hidden
                  hover:shadow-md transition-shadow">
                {/* 封面区 */}
                <div className="h-28 bg-gradient-to-br from-[--paper-dark] to-amber-100
                  flex items-center justify-center overflow-hidden relative">
                  {url ? (
                    <img src={url} alt={c.books?.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  ) : null}
                  <span className="relative text-5xl">🏮</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[--ink] group-hover:text-[--gold] transition-colors
                    line-clamp-1">{c.name}</h3>
                  {c.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>by {c.profiles?.username}</span>
                    <span>{c.member_count} 人</span>
                  </div>
                  {c.books?.title && (
                    <div className="mt-2 text-xs text-[--gold] truncate">
                      📖 {c.books.title}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
