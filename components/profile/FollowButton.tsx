'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string
  initialFollowing: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const url = following
      ? `/api/follows?followingId=${targetUserId}`
      : '/api/follows'
    const body = following ? undefined : JSON.stringify({ followingId: targetUserId })

    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
    })

    if (res.ok) {
      setFollowing(!following)
      toast.success(following ? '已取消关注' : '关注成功')
    } else {
      const { error } = await res.json()
      toast.error('操作失败', { description: error })
    }
    setLoading(false)
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={following ? 'outline' : 'default'}
      className={following
        ? 'border-[--ink] text-[--ink]'
        : 'bg-[--ink] text-[--paper]'}>
      {loading ? '...' : following ? '已关注' : '+ 关注'}
    </Button>
  )
}
