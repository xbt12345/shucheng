'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/books', label: '书库' },
  { href: '/discover', label: '发现' },
  { href: '/booklists', label: '书单' },
  { href: '/circles', label: '话题圈' },
  { href: '/community', label: '社区' },
]

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <nav className="border-b border-[--border] bg-[--ink] text-[--paper] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[--gold] shrink-0">
          儒典书城
        </Link>
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                isActive(href)
                  ? 'bg-[--gold]/20 text-[--gold] font-medium'
                  : 'hover:text-[--gold]'
              }`}>
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isActive('/profile')
                    ? 'bg-[--gold]/20 text-[--gold] font-medium'
                    : 'hover:text-[--gold]'
                }`}>
                我的
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}
                className="text-[--paper] hover:text-[--gold] ml-1">
                退出
              </Button>
            </>
          ) : (
            <Link href="/auth/login" className="ml-2">
              <Button size="sm" variant="outline"
                className="border-[--gold] text-[--gold] hover:bg-[--gold] hover:text-[--ink]">
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
