'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
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

  return (
    <nav className="border-b border-[--border] bg-[--ink] text-[--paper]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[--gold]">
          儒典书城
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/books" className="hover:text-[--gold] transition-colors">书库</Link>
          <Link href="/community" className="hover:text-[--gold] transition-colors">社区</Link>
          {user ? (
            <>
              <Link href="/profile" className="hover:text-[--gold] transition-colors">我的</Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-[--paper] hover:text-[--gold]"
              >
                退出
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
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
