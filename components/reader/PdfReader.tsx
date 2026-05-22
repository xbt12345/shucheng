'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  pdfUrl: string
  bookId: string
  bookTitle: string
}

export function PdfReader({ pdfUrl, bookId, bookTitle }: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[#1a1208]">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 h-12 bg-[#2a1f12] border-b border-amber-900/30 shrink-0">
        <Link href={`/books/${bookId}`}
          className="text-amber-200/70 hover:text-[--gold] text-sm flex items-center gap-1.5 transition-colors">
          ← 返回
        </Link>
        <h1 className="text-sm font-medium text-amber-100/80 truncate max-w-xs">{bookTitle}</h1>
        <a href={pdfUrl} target="_blank" rel="noreferrer"
          className="text-amber-200/70 hover:text-[--gold] text-xs transition-colors">
          新窗口打开 ↗
        </a>
      </div>

      {/* PDF 区域 */}
      <div className="flex-1 relative">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-amber-200/60">
              <div className="text-4xl mb-3 animate-pulse">📄</div>
              <p className="text-sm">正在加载文档...</p>
            </div>
          </div>
        )}
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoaded(true)}
          title={bookTitle}
        />
      </div>
    </div>
  )
}
