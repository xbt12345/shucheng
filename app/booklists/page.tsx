import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CreateBooklistButton } from '@/components/booklists/CreateBooklistButton'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = { title: '书单 — 儒典书城' }

export default async function BooklistsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: publicLists }, { data: myLists }] = await Promise.all([
    supabase
      .from('booklists')
      .select('*, profiles(username), booklist_items(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(30),
    user
      ? supabase
          .from('booklists')
          .select('*, booklist_items(count)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--ink]">书单</h1>
          <p className="text-sm text-gray-500 mt-1">精选经典，分享阅读清单</p>
        </div>
        {user && <CreateBooklistButton />}
      </div>

      {/* 我的书单 */}
      {user && myLists && myLists.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-[--ink] mb-4">我的书单</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myLists.map((bl: any) => (
              <BooklistCard key={bl.id} bl={bl} isOwner />
            ))}
          </div>
        </section>
      )}

      {/* 公开书单 */}
      <section>
        <h2 className="text-base font-bold text-[--ink] mb-4">精选公开书单</h2>
        {(publicLists ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📚</div>
            <p>暂无公开书单，快来创建第一个</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(publicLists ?? []).map((bl: any) => (
              <BooklistCard key={bl.id} bl={bl} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function BooklistCard({ bl, isOwner }: { bl: any; isOwner?: boolean }) {
  const count = bl.booklist_items?.[0]?.count ?? 0
  return (
    <Link href={`/booklists/${bl.id}`}
      className="group bg-white border border-[--border] rounded-xl p-5
        hover:shadow-md transition-shadow flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-[--ink] group-hover:text-[--gold] transition-colors
          line-clamp-1 flex-1">{bl.title}</h3>
        {!bl.is_public && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2 shrink-0">
            私密
          </span>
        )}
      </div>
      {bl.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{bl.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2">
        <span>{isOwner ? '我的书单' : `by ${bl.profiles?.username}`}</span>
        <span>{count} 本书</span>
      </div>
    </Link>
  )
}
