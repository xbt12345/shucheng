'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Comment = {
  id: string
  content: string
  created_at: string
  profiles: { username: string }
  books: { title: string }
}

export function ReviewQueue({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/comments?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== id))
      toast.success('评论已删除')
    } else {
      toast.error('删除失败')
    }
  }

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-gray-500 text-center py-8">暂无待审核评论</p>
      )}
      {comments.map(comment => (
        <div key={comment.id} className="bg-white border border-[--border] rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs text-gray-500">
              <span className="font-medium">{comment.profiles.username}</span>
              {' · '}《{comment.books.title}》
              {' · '}{new Date(comment.created_at).toLocaleDateString('zh-CN')}
            </div>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(comment.id)}>
              删除
            </Button>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}
