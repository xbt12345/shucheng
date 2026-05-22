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
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[--ink] mb-4">书评 ({comments.length})</h2>
      {loggedIn ? (
        <div className="mb-6 p-4 bg-[--paper-dark] rounded-lg">
          <CommentForm bookId={bookId} onSuccess={load} />
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          <a href="/auth/login" className="text-[--gold] hover:underline">登录</a> 后发表书评
        </p>
      )}
      <div>
        {comments.map(c => <CommentCard key={c.id} comment={c} />)}
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">还没有书评，来写第一篇吧</p>
        )}
      </div>
    </div>
  )
}
