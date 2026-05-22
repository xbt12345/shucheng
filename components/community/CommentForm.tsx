'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Props = {
  bookId: string
  onSuccess: () => void
  placeholder?: string
  showRating?: boolean
}

export function CommentForm({ bookId, onSuccess, placeholder = '写下你的书评...', showRating = true }: Props) {
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, content, rating: showRating ? rating : null }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      toast.error('发布失败', { description: error })
    } else {
      setContent('')
      setRating(0)
      onSuccess()
      toast.success('书评发布成功')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {showRating && (
        <div className="flex gap-1">
          {[1,2,3,4,5].map(s => (
            <button key={s} type="button" onClick={() => setRating(s)}
              className={`text-2xl transition-colors ${s <= rating ? 'text-[--gold]' : 'text-gray-300'}`}>
              ★
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-gray-500 ml-2">{rating} 星</span>}
        </div>
      )}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full h-24 border border-[--border] rounded-lg p-3 text-sm
          resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
        maxLength={2000}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{content.length}/2000</span>
        <Button type="submit" size="sm" className="bg-[--ink] text-[--paper]"
          disabled={submitting || !content.trim()}>
          {submitting ? '发布中...' : '发布书评'}
        </Button>
      </div>
    </form>
  )
}
