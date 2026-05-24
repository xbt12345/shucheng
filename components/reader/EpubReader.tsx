'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReaderStore } from '@/stores/reader'
import { ReaderToolbar } from './ReaderToolbar'
import { HighlightMenu } from './HighlightMenu'
import { HighlightLayer } from './HighlightLayer'

const themeStyles = {
  paper: { body: { background: '#faf8f4', color: '#3d2c1e', 'line-height': '1.9' } },
  eye:   { body: { background: '#c7edcc', color: '#1a2e1a', 'line-height': '1.9' } },
  night: { body: { background: '#1a1208', color: '#e8dcc8', 'line-height': '1.9' } },
}

type Props = {
  epubUrl: string
  bookId: string
  initialCfi?: string
}

export function EpubReader({ epubUrl, bookId, initialCfi }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null)
  const { fontSize, theme, openHighlightMenu } = useReaderStore()

  // Refs 记录最新值，避免 initReader 依赖 fontSize/theme 导致反复重初始化
  const fontSizeRef = useRef(fontSize)
  const themeRef = useRef(theme)
  useEffect(() => { fontSizeRef.current = fontSize }, [fontSize])
  useEffect(() => { themeRef.current = theme }, [theme])

  const initReader = useCallback(async () => {
    if (!containerRef.current || bookRef.current) return

    // Dynamic import to avoid SSR issues
    const ePub = (await import('epubjs')).default
    const book = ePub(epubUrl)
    bookRef.current = book

    const rendition = book.renderTo(containerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
    })
    renditionRef.current = rendition

    Object.entries(themeStyles).forEach(([name, style]) => {
      rendition.themes.register(name, style)
    })
    rendition.themes.select(themeRef.current)
    rendition.themes.fontSize(`${fontSizeRef.current}px`)

    rendition.on('selected', (cfiRange: string, contents: { window: Window }) => {
      const selection = contents.window.getSelection()
      const text = selection?.toString().trim()
      if (text && text.length > 0) {
        openHighlightMenu(cfiRange, text)
      }
    })

    if (initialCfi) {
      await rendition.display(initialCfi)
    } else {
      await rendition.display()
    }
  // fontSize / theme 通过 ref 读取，不需要在依赖中，避免重初始化
  }, [epubUrl, openHighlightMenu, initialCfi]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initReader()
    return () => {
      bookRef.current?.destroy()
      bookRef.current = null
      renditionRef.current = null
    }
  }, [initReader])

  // 字体/主题变更：直接调用 rendition API，不重新加载书籍
  useEffect(() => {
    if (!renditionRef.current) return
    renditionRef.current.themes.select(theme)
    renditionRef.current.themes.fontSize(`${fontSize}px`)
  }, [fontSize, theme])

  const goNext = () => renditionRef.current?.next()
  const goPrev = () => renditionRef.current?.prev()

  // 背景色跟主题同步（容器层，epub iframe 外的区域）
  const bgMap = { paper: 'bg-[#faf8f4]', eye: 'bg-[#c7edcc]', night: 'bg-[#1a1208]' }

  return (
    <div className={`h-screen flex flex-col ${bgMap[theme]}`}>
      <ReaderToolbar bookId={bookId} />
      <div className="flex-1 relative overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
        <HighlightMenu bookId={bookId} rendition={renditionRef} />
        <HighlightLayer bookId={bookId} rendition={renditionRef} />
        <button onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-20
            flex items-center justify-center text-gray-400 hover:text-[--ink]
            bg-white/50 rounded-lg backdrop-blur-sm text-2xl z-10">
          ‹
        </button>
        <button onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-20
            flex items-center justify-center text-gray-400 hover:text-[--ink]
            bg-white/50 rounded-lg backdrop-blur-sm text-2xl z-10">
          ›
        </button>
      </div>
    </div>
  )
}
