'use client'

import { useReaderStore, type ReaderTheme } from '@/stores/reader'
import Link from 'next/link'

const themes: { value: ReaderTheme; label: string }[] = [
  { value: 'paper', label: '纸白' },
  { value: 'eye',   label: '护眼' },
  { value: 'night', label: '夜间' },
]

export function ReaderToolbar({ bookId }: { bookId: string }) {
  const { fontSize, theme, setFontSize, setTheme } = useReaderStore()

  return (
    <div className="h-12 border-b border-[--border] bg-white flex items-center
      justify-between px-4 gap-4 text-sm">
      <Link href={`/books/${bookId}`} className="text-gray-500 hover:text-[--ink]">
        ← 返回
      </Link>
      <div className="flex items-center gap-3">
        <button onClick={() => setFontSize(Math.max(14, fontSize - 2))}
          className="w-7 h-7 rounded border border-[--border] hover:bg-[--paper-dark]">
          A-
        </button>
        <span className="text-xs text-gray-500">{fontSize}px</span>
        <button onClick={() => setFontSize(Math.min(28, fontSize + 2))}
          className="w-7 h-7 rounded border border-[--border] hover:bg-[--paper-dark]">
          A+
        </button>
        {themes.map(t => (
          <button key={t.value}
            onClick={() => setTheme(t.value)}
            className={`px-2 py-1 rounded text-xs border transition-colors ${
              theme === t.value
                ? 'bg-[--ink] text-[--paper] border-[--ink]'
                : 'border-[--border] hover:bg-[--paper-dark]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
