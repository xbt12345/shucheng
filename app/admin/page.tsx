import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalBooks },
    { count: totalUsers },
    { count: totalHighlights },
    { count: totalComments },
    { data: topBooks },
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('highlights').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('title, view_count').order('view_count', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: '书籍总数', value: totalBooks ?? 0, icon: '📚' },
    { label: '注册用户', value: totalUsers ?? 0, icon: '👥' },
    { label: '标注总数', value: totalHighlights ?? 0, icon: '✏️' },
    { label: '书评总数', value: totalComments ?? 0, icon: '💬' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[--ink] mb-6">数据看板</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-[--border] rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-[--ink]">{s.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[--border] rounded-xl p-4">
        <h2 className="font-bold text-[--ink] mb-4">热门书籍 Top 5</h2>
        <div className="space-y-3">
          {(topBooks ?? []).map((book, i) => (
            <div key={book.title} className="flex items-center gap-3">
              <span className="text-[--gold] font-bold w-4">{i + 1}</span>
              <span className="flex-1 text-sm">{book.title}</span>
              <span className="text-xs text-gray-500">{book.view_count} 次阅读</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
