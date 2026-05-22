import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const revalidate = 300

const colorMap: Record<string, string> = {
  yellow: 'bg-yellow-100 border-yellow-300',
  red: 'bg-red-100 border-red-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
}

export default async function HotHighlightsPage() {
  const supabase = await createClient()

  const { data: highlights } = await supabase
    .from('highlights')
    .select('*, profiles(username, avatar_url), books(title, author)')
    .eq('visibility', 'public')
    .order('like_count', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[--ink] mb-6">热门标注广场</h1>
      <div className="space-y-4">
        {(highlights ?? []).map((h: any) => (
          <div key={h.id}
            className={`border rounded-xl p-4 ${colorMap[h.color] ?? 'bg-gray-50 border-gray-200'}`}>
            <blockquote className="text-[--ink] font-medium leading-relaxed mb-3">
              「{h.text}」
            </blockquote>
            {h.note && (
              <p className="text-gray-700 text-sm mb-3 pl-3 border-l-2 border-[--gold]">
                {h.note}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={h.profiles?.avatar_url} />
                  <AvatarFallback className="text-[8px]">{h.profiles?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span>{h.profiles?.username}</span>
                <span>·</span>
                <Link href={`/books/${h.book_id}`} className="hover:text-[--gold]">
                  《{h.books?.title}》
                </Link>
              </div>
              <span>❤️ {h.like_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
