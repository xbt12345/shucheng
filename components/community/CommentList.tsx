'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommentCard } from './CommentCard'
import { CommentForm } from './CommentForm'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  content: string
  rating: number | null
  like_count: number
  created_at: string
  profiles: { username: string; avatar_url: string | null }
}

export function CommentList({ bookId }: { bookId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?bookId=${bookId}`)
    if (res.ok) setComments(await res.json())
  }, [bookId])

  useEffect(() => {
    load()
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
  }, [load])

  return (
    <div className="bg-white border border-[--border] rounded-2xl overflow-hidden">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
        <h2 className="font-bold text-[--ink] flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span>书评</span>
          {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({comments.length})</span>
          )}
        </h2>
      </div>

      {/* 写书评区 */}
      <div className="px-6 py-5 border-b border-[--border] bg-[--paper-dark]/30">
        {loggedIn ? (
          <CommentForm bookId={bookId} onSuccess={load} />
        ) : (
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-gray-500">登录后可发表书评，分享你的阅读感悟</p>
            <a href="/auth/login"
              className="px-4 py-2 rounded-lg bg-[--ink] text-[--paper] text-sm font-medium
                hover:bg-[--gold] hover:text-[--ink] transition-colors">
              登录
            </a>
          </div>
        )}
      </div>

      {/* 书评列表 */}
      <div className="divide-y divide-[--border]">
        {comments.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <div className="text-4xl mb-3 opacity-50">✍️</div>
            <p className="text-sm">尚无书评</p>
            <p className="text-xs mt-1 text-gray-300">成为第一位留下感悟的读者</p>
          </div>
        ) : (
          comments.map(c => <CommentCard key={c.id} comment={c} />)
        )}
      </div>
    </div>
  )
}
