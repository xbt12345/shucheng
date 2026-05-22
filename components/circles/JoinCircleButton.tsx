'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Props = {
  circleId: string
  initialJoined: boolean
  memberCount: number
}

export function JoinCircleButton({ circleId, initialJoined, memberCount }: Props) {
  const [joined, setJoined] = useState(initialJoined)
  const [count, setCount] = useState(memberCount)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const method = joined ? 'DELETE' : 'POST'
    const res = await fetch(`/api/circles/${circleId}/join`, { method })
    if (res.ok) {
      const next = !joined
      setJoined(next)
      setCount(c => next ? c + 1 : Math.max(1, c - 1))
      toast.success(next ? '已加入话题圈' : '已退出话题圈')
    } else {
      const { error } = await res.json()
      toast.error('操作失败', { description: error })
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <div className="text-2xl font-bold text-[--ink]">{count}</div>
        <div className="text-xs text-gray-400">成员</div>
      </div>
      <Button
        onClick={toggle}
        disabled={loading}
        variant={joined ? 'outline' : 'default'}
        size="sm"
        className={joined
          ? 'border-[--border] text-gray-500 hover:border-red-300 hover:text-red-500'
          : 'bg-[--ink] text-[--paper]'
        }>
        {loading ? '...' : joined ? '已加入' : '+ 加入'}
      </Button>
    </div>
  )
}
