import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-48 bg-[--ink] text-[--paper] flex-shrink-0 p-4">
        <h2 className="text-[--gold] font-bold mb-6 text-sm">管理后台</h2>
        <nav className="space-y-2 text-sm">
          {[
            { href: '/admin', label: '📊 数据看板' },
            { href: '/admin/books', label: '📚 书籍管理' },
            { href: '/admin/books/upload', label: '⬆️ 上传书籍' },
            { href: '/admin/users', label: '👥 用户管理' },
            { href: '/admin/reviews', label: '🔍 评论审核' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="block py-2 px-3 rounded hover:bg-white/10 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-[--paper]">{children}</main>
    </div>
  )
}
