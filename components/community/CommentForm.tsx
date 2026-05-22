'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  bookId: string
  onSuccess: () => void
  placeholder?: string
  showRating?: boolean
}

const STAR_LABELS = ['', '很差', '较差', '一般', '推荐', '力荐']

export function CommentForm({ bookId, onSuccess, placeholder = '写下你的感悟与书评...', showRating = true }: Props) {
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const displayRating = hovered || rating

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {showRating && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                className={`text-3xl transition-all duration-100 hover:scale-110 ${
                  s <= displayRating ? 'text-[--gold] drop-shadow-sm' : 'text-gray-200 hover:text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <span className={`text-sm font-medium transition-colors ${
            displayRating > 0 ? 'text-[--gold]' : 'text-gray-400'
          }`}>
            {displayRating > 0 ? STAR_LABELS[displayRating] : '点击评分'}
          </span>
        </div>
      )}

      <div className="relative">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full h-28 border-2 border-[--paper-dark] rounded-xl p-4 text-sm
            resize-none transition-colors
            focus:outline-none focus:border-[--gold]/50 focus:bg-white
            bg-[--paper-dark]/50 placeholder-gray-400"
          maxLength={2000}
        />
        <span className="absolute bottom-3 right-3 text-xs text-gray-300">
          {content.length}/2000
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-[--ink] text-[--paper]
            hover:bg-[--gold] hover:text-[--ink]
            active:scale-95 shadow hover:shadow-md"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              发布中
            </span>
          ) : '发布书评'}
        </button>
      </div>
    </form>
  )
}
