'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    router.push(`/books?${params.toString()}`)
  }

  const handleClear = () => {
    setQ('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/books?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-sm">
      <div className="relative flex-1">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜索书名、作者..."
          className="w-full border border-[--border] rounded-full px-4 py-1.5 text-sm
            bg-[--paper] focus:outline-none focus:ring-1 focus:ring-[--gold] pr-8"
        />
        {q && (
          <button type="button" onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
            ✕
          </button>
        )}
      </div>
      <button type="submit"
        className="px-4 py-1.5 bg-[--ink] text-[--paper] text-sm rounded-full
          hover:bg-[--gold] hover:text-[--ink] transition-colors shrink-0">
        搜索
      </button>
    </form>
  )
}
