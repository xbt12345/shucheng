'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['全部', '儒', '释', '道', '史', '集']

export function CategoryTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? '全部'

  const handleSelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === '全部') {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    router.push(`/books?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => handleSelect(cat)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            current === cat
              ? 'bg-[--ink] text-[--paper]'
              : 'bg-[--paper-dark] text-[--ink] hover:bg-[--gold] hover:text-[--ink]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
