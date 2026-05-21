# 儒典书城 Plan 2：书库 + 阅读器 + 实时标注

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **前置条件：Plan 1 完成（DB Schema + Auth 可用）**

**Goal:** 实现 M1 书库模块（书籍列表/详情/搜索）和 M2 阅读器模块（epub.js 渲染、4色高亮标注、Supabase Realtime 他人标注实时叠加）。

**Architecture:** 书籍元数据存 PostgreSQL，epub 文件存 Supabase Storage。阅读器用 epub.js 加载 epub，划词生成 CFI Range，写入 highlights 表，Supabase Realtime 订阅广播给同章节读者。Next.js SSR 渲染书籍详情页保证 SEO。

**Tech Stack:** Next.js 15, epub.js v0.3, Supabase JS v2 (Realtime), TailwindCSS, Zustand, Vitest

---

## 文件结构

```
app/
├── books/
│   ├── page.tsx                        # 书库列表（SSR）
│   └── [id]/
│       ├── page.tsx                    # 书籍详情（SSR）
│       └── read/
│           └── page.tsx                # 阅读器页（Client）
components/
├── books/
│   ├── BookCard.tsx                    # 书籍卡片
│   ├── BookGrid.tsx                    # 书籍网格列表
│   ├── BookDetail.tsx                  # 书籍详情信息
│   └── CategoryTabs.tsx                # 分类 Tab（儒/释/道/史/集）
├── reader/
│   ├── EpubReader.tsx                  # epub.js 主阅读器（Client）
│   ├── HighlightMenu.tsx               # 划词弹出菜单（颜色选择+批注）
│   ├── HighlightLayer.tsx              # 他人标注叠加层
│   ├── ReaderToolbar.tsx               # 字体/主题/目录工具栏
│   └── ReadingProgress.tsx             # 进度条
lib/
├── supabase/
│   └── highlights.ts                   # highlights CRUD + Realtime 订阅
├── epub/
│   └── parser.ts                       # epub 章节解析工具
stores/
└── reader.ts                           # Zustand 阅读器状态
__tests__/
├── books.test.ts
└── highlights.test.ts
```

---

## Task 1：书库列表页

**Files:**
- Create: `app/books/page.tsx`
- Create: `components/books/BookCard.tsx`
- Create: `components/books/BookGrid.tsx`
- Create: `components/books/CategoryTabs.tsx`
- Create: `__tests__/books.test.ts`

- [ ] **Step 1：写失败测试**

创建 `__tests__/books.test.ts`：
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BookCard } from '@/components/books/BookCard'

const mockBook = {
  id: 'test-id',
  title: '道德经',
  author: '老子',
  category: '道',
  description: '万经之王',
  cover_url: null,
  file_url: 'test.epub',
  published_at: null,
  is_public: true,
  view_count: 100,
  created_at: '2026-01-01',
}

describe('BookCard', () => {
  it('renders book title and author', () => {
    render(<BookCard book={mockBook} />)
    expect(screen.getByText('道德经')).toBeTruthy()
    expect(screen.getByText('老子')).toBeTruthy()
  })

  it('renders category badge', () => {
    render(<BookCard book={mockBook} />)
    expect(screen.getByText('道')).toBeTruthy()
  })
})
```

- [ ] **Step 2：运行确认失败**

```bash
npm test -- books.test.ts
```
预期：FAIL — `BookCard` not found

- [ ] **Step 3：创建 BookCard 组件**

创建 `components/books/BookCard.tsx`：
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

export type Book = {
  id: string
  title: string
  author: string
  category: string
  description: string | null
  cover_url: string | null
  file_url: string | null
  published_at: string | null
  is_public: boolean
  view_count: number
  created_at: string
}

const categoryColors: Record<string, string> = {
  儒: 'bg-amber-100 text-amber-800',
  释: 'bg-purple-100 text-purple-800',
  道: 'bg-teal-100 text-teal-800',
  史: 'bg-blue-100 text-blue-800',
  集: 'bg-rose-100 text-rose-800',
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="bg-white border border-[--border] rounded-lg overflow-hidden
        hover:shadow-md transition-shadow duration-200">
        <div className="aspect-[3/4] bg-[--paper-dark] flex items-center justify-center
          overflow-hidden">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title}
              width={200} height={280} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-sm font-medium text-[--ink] line-clamp-2">{book.title}</p>
            </div>
          )}
        </div>
        <div className="p-3">
          <Badge className={`text-xs mb-1 ${categoryColors[book.category] ?? ''}`}>
            {book.category}
          </Badge>
          <h3 className="font-medium text-[--ink] line-clamp-1 group-hover:text-[--gold]
            transition-colors">{book.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4：创建 CategoryTabs 组件**

创建 `components/books/CategoryTabs.tsx`：
```typescript
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
        <button key={cat}
          onClick={() => handleSelect(cat)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            current === cat
              ? 'bg-[--ink] text-[--paper]'
              : 'bg-[--paper-dark] text-[--ink] hover:bg-[--gold] hover:text-[--ink]'
          }`}>
          {cat}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5：创建 BookGrid 组件**

创建 `components/books/BookGrid.tsx`：
```typescript
import { BookCard, type Book } from './BookCard'

export function BookGrid({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">📚</p>
        <p>暂无书籍</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  )
}
```

- [ ] **Step 6：创建书库列表页（SSR）**

创建 `app/books/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { BookGrid } from '@/components/books/BookGrid'
import { CategoryTabs } from '@/components/books/CategoryTabs'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '书库 — 儒典书城',
  description: '浏览儒释道与中国传统文化经典书库',
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('books').select('*').order('view_count', { ascending: false })

  if (category && category !== '全部') {
    query = query.eq('category', category)
  }
  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`)
  }

  const { data: books } = await query.limit(50)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[--ink]">书库</h1>
      </div>
      <Suspense>
        <CategoryTabs />
      </Suspense>
      <div className="mt-6">
        <BookGrid books={books ?? []} />
      </div>
    </div>
  )
}
```

- [ ] **Step 7：运行测试**

```bash
npm test -- books.test.ts
```
预期：PASS

- [ ] **Step 8：提交**

```bash
git add .
git commit -m "feat: add book library list page with category filtering"
```

---

## Task 2：书籍详情页

**Files:**
- Create: `app/books/[id]/page.tsx`
- Create: `components/books/BookDetail.tsx`

- [ ] **Step 1：创建 BookDetail 组件**

创建 `components/books/BookDetail.tsx`：
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Book } from './BookCard'

const categoryColors: Record<string, string> = {
  儒: 'bg-amber-100 text-amber-800',
  释: 'bg-purple-100 text-purple-800',
  道: 'bg-teal-100 text-teal-800',
  史: 'bg-blue-100 text-blue-800',
  集: 'bg-rose-100 text-rose-800',
}

export function BookDetail({ book }: { book: Book }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* 封面 */}
      <div className="flex-shrink-0">
        <div className="w-40 h-56 bg-[--paper-dark] rounded-lg overflow-hidden flex
          items-center justify-center">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title}
              width={160} height={224} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <div className="text-5xl mb-2">📖</div>
              <p className="text-sm font-medium text-[--ink]">{book.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* 信息 */}
      <div className="flex-1">
        <Badge className={`mb-2 ${categoryColors[book.category] ?? ''}`}>
          {book.category}
        </Badge>
        <h1 className="text-3xl font-bold text-[--ink] mb-1">{book.title}</h1>
        <p className="text-gray-600 mb-4">{book.author}</p>
        {book.description && (
          <p className="text-gray-700 leading-relaxed mb-6">{book.description}</p>
        )}
        <div className="flex gap-3">
          {book.file_url ? (
            <Link href={`/books/${book.id}/read`}>
              <Button className="bg-[--ink] text-[--paper] hover:bg-[--gold] hover:text-[--ink]">
                开始阅读
              </Button>
            </Link>
          ) : (
            <Button disabled>暂无电子版</Button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          已有 {book.view_count} 人阅读
          {book.is_public && ' · 公版经典，永久免费'}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2：创建书籍详情页（SSR）**

创建 `app/books/[id]/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { BookDetail } from '@/components/books/BookDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('title,author').eq('id', id).single()
  if (!book) return { title: '书籍未找到' }
  return {
    title: `${book.title} — 儒典书城`,
    description: `在线阅读《${book.title}》，作者：${book.author}`,
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase.from('books').select('*').eq('id', id).single()
  if (!book) notFound()

  // 增加浏览量
  await supabase.rpc('increment_view_count', { book_id: id })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BookDetail book={book} />
    </div>
  )
}
```

- [ ] **Step 3：添加 increment_view_count RPC**

创建新迁移：
```bash
supabase migration new add_view_count_rpc
```

在生成的迁移文件中写入：
```sql
CREATE OR REPLACE FUNCTION increment_view_count(book_id UUID)
RETURNS VOID AS $$
  UPDATE books SET view_count = view_count + 1 WHERE id = book_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

应用：
```bash
supabase db reset
```

- [ ] **Step 4：提交**

```bash
git add .
git commit -m "feat: add book detail page with SSR and view count"
```

---

## Task 3：Zustand 阅读器状态 + epub.js 基础阅读器

**Files:**
- Create: `stores/reader.ts`
- Create: `components/reader/EpubReader.tsx`
- Create: `app/books/[id]/read/page.tsx`

- [ ] **Step 1：安装 epub.js**

```bash
npm install epubjs
npm install -D @types/epubjs
```

- [ ] **Step 2：创建阅读器状态 store**

创建 `stores/reader.ts`：
```typescript
import { create } from 'zustand'

export type ReaderTheme = 'paper' | 'eye' | 'night'
export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green'

type ReaderState = {
  // 阅读设置
  fontSize: number
  theme: ReaderTheme
  // 当前位置
  currentCfi: string | null
  currentChapterId: string | null
  // 高亮标注相关
  selectedCfi: string | null
  selectedText: string | null
  showHighlightMenu: boolean
  // Actions
  setFontSize: (size: number) => void
  setTheme: (theme: ReaderTheme) => void
  setCurrentCfi: (cfi: string) => void
  setCurrentChapterId: (id: string) => void
  openHighlightMenu: (cfi: string, text: string) => void
  closeHighlightMenu: () => void
}

export const useReaderStore = create<ReaderState>(set => ({
  fontSize: 18,
  theme: 'paper',
  currentCfi: null,
  currentChapterId: null,
  selectedCfi: null,
  selectedText: null,
  showHighlightMenu: false,

  setFontSize: size => set({ fontSize: size }),
  setTheme: theme => set({ theme }),
  setCurrentCfi: cfi => set({ currentCfi: cfi }),
  setCurrentChapterId: id => set({ currentChapterId: id }),
  openHighlightMenu: (cfi, text) => set({
    selectedCfi: cfi,
    selectedText: text,
    showHighlightMenu: true,
  }),
  closeHighlightMenu: () => set({
    selectedCfi: null,
    selectedText: null,
    showHighlightMenu: false,
  }),
}))
```

- [ ] **Step 3：创建 EpubReader 组件**

创建 `components/reader/EpubReader.tsx`：
```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'
import ePub, { type Book, type Rendition } from 'epubjs'
import { useReaderStore } from '@/stores/reader'
import { HighlightMenu } from './HighlightMenu'
import { ReaderToolbar } from './ReaderToolbar'

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
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const { fontSize, theme, openHighlightMenu } = useReaderStore()

  const initReader = useCallback(async () => {
    if (!containerRef.current || bookRef.current) return

    const book = ePub(epubUrl)
    bookRef.current = book

    const rendition = book.renderTo(containerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
    })
    renditionRef.current = rendition

    // 注册主题
    Object.entries(themeStyles).forEach(([name, style]) => {
      rendition.themes.register(name, style)
    })
    rendition.themes.select(theme)
    rendition.themes.fontSize(`${fontSize}px`)

    // 划词事件
    rendition.on('selected', (cfiRange: string, contents: { window: Window }) => {
      const selection = contents.window.getSelection()
      const text = selection?.toString().trim()
      if (text && text.length > 0) {
        openHighlightMenu(cfiRange, text)
      }
    })

    // 恢复阅读位置
    if (initialCfi) {
      await rendition.display(initialCfi)
    } else {
      await rendition.display()
    }
  }, [epubUrl, theme, fontSize, openHighlightMenu, initialCfi])

  useEffect(() => {
    initReader()
    return () => {
      bookRef.current?.destroy()
      bookRef.current = null
      renditionRef.current = null
    }
  }, [initReader])

  // 字体/主题变化时更新
  useEffect(() => {
    if (!renditionRef.current) return
    renditionRef.current.themes.select(theme)
    renditionRef.current.themes.fontSize(`${fontSize}px`)
  }, [fontSize, theme])

  const goNext = () => renditionRef.current?.next()
  const goPrev = () => renditionRef.current?.prev()

  return (
    <div className="h-screen flex flex-col">
      <ReaderToolbar bookId={bookId} />
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" />
        <HighlightMenu bookId={bookId} rendition={renditionRef} />
        {/* 翻页按钮 */}
        <button onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-20
            flex items-center justify-center text-gray-400 hover:text-[--ink]
            bg-white/50 rounded-lg backdrop-blur-sm">
          ‹
        </button>
        <button onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-20
            flex items-center justify-center text-gray-400 hover:text-[--ink]
            bg-white/50 rounded-lg backdrop-blur-sm">
          ›
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4：创建 ReaderToolbar**

创建 `components/reader/ReaderToolbar.tsx`：
```typescript
'use client'

import { useReaderStore, type ReaderTheme } from '@/stores/reader'
import { Button } from '@/components/ui/button'
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
        {/* 字体大小 */}
        <button onClick={() => setFontSize(Math.max(14, fontSize - 2))}
          className="w-7 h-7 rounded border border-[--border] hover:bg-[--paper-dark]">
          A-
        </button>
        <span className="text-xs text-gray-500">{fontSize}px</span>
        <button onClick={() => setFontSize(Math.min(28, fontSize + 2))}
          className="w-7 h-7 rounded border border-[--border] hover:bg-[--paper-dark]">
          A+
        </button>
        {/* 主题 */}
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
```

- [ ] **Step 5：创建阅读页**

创建 `app/books/[id]/read/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { EpubReader } from '@/components/reader/EpubReader'
import { notFound, redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function ReadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/books/${id}/read`)

  const { data: book } = await supabase
    .from('books').select('id, title, file_url').eq('id', id).single()
  if (!book || !book.file_url) notFound()

  // 获取上次阅读位置
  const { data: log } = await supabase
    .from('reading_logs')
    .select('progress_cfi')
    .eq('user_id', user.id)
    .eq('book_id', id)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single()

  // 生成临时访问 URL
  const { data: { publicUrl } } = supabase.storage
    .from('books').getPublicUrl(book.file_url)

  return (
    <EpubReader
      epubUrl={publicUrl}
      bookId={id}
      initialCfi={log?.progress_cfi ?? undefined}
    />
  )
}
```

- [ ] **Step 6：提交**

```bash
git add .
git commit -m "feat: add epub.js reader with theme and font size controls"
```

---

## Task 4：高亮标注 + Realtime 叠加

**Files:**
- Create: `lib/supabase/highlights.ts`
- Create: `components/reader/HighlightMenu.tsx`
- Create: `components/reader/HighlightLayer.tsx`
- Create: `__tests__/highlights.test.ts`

- [ ] **Step 1：写失败测试**

创建 `__tests__/highlights.test.ts`：
```typescript
import { describe, it, expect, vi } from 'vitest'
import { buildHighlightInsert } from '@/lib/supabase/highlights'

describe('buildHighlightInsert', () => {
  it('returns correct insert payload', () => {
    const payload = buildHighlightInsert({
      userId: 'user-1',
      bookId: 'book-1',
      chapterId: 'ch-1',
      cfiRange: 'epubcfi(/6/4!/1:10,/1:20)',
      text: '道可道',
      color: 'yellow',
      note: '',
      visibility: 'public',
    })
    expect(payload.user_id).toBe('user-1')
    expect(payload.text).toBe('道可道')
    expect(payload.color).toBe('yellow')
    expect(payload.visibility).toBe('public')
    expect(payload.note).toBeNull()
  })

  it('sets note to null when empty string', () => {
    const payload = buildHighlightInsert({
      userId: 'u', bookId: 'b', chapterId: 'c',
      cfiRange: 'cfi', text: '文', color: 'red',
      note: '', visibility: 'private',
    })
    expect(payload.note).toBeNull()
  })
})
```

- [ ] **Step 2：运行确认失败**

```bash
npm test -- highlights.test.ts
```
预期：FAIL

- [ ] **Step 3：创建 highlights 工具库**

创建 `lib/supabase/highlights.ts`：
```typescript
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green'
export type HighlightVisibility = 'public' | 'friends' | 'private'

export type HighlightInsertInput = {
  userId: string
  bookId: string
  chapterId: string | null
  cfiRange: string
  text: string
  color: HighlightColor
  note: string
  visibility: HighlightVisibility
}

export type HighlightRow = {
  id: string
  user_id: string
  book_id: string
  chapter_id: string | null
  cfi_range: string
  text: string
  color: HighlightColor
  note: string | null
  visibility: HighlightVisibility
  like_count: number
  created_at: string
}

export function buildHighlightInsert(input: HighlightInsertInput) {
  return {
    user_id: input.userId,
    book_id: input.bookId,
    chapter_id: input.chapterId,
    cfi_range: input.cfiRange,
    text: input.text,
    color: input.color,
    note: input.note.trim() || null,
    visibility: input.visibility,
  }
}

export async function insertHighlight(
  supabase: SupabaseClient,
  input: HighlightInsertInput
): Promise<HighlightRow | null> {
  const { data, error } = await supabase
    .from('highlights')
    .insert(buildHighlightInsert(input))
    .select()
    .single()
  if (error) { console.error('insertHighlight error:', error); return null }
  return data
}

export async function fetchChapterHighlights(
  supabase: SupabaseClient,
  bookId: string,
  chapterId: string | null
): Promise<HighlightRow[]> {
  let query = supabase
    .from('highlights')
    .select('*')
    .eq('book_id', bookId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (chapterId) query = query.eq('chapter_id', chapterId)

  const { data } = await query
  return data ?? []
}

export function subscribeToHighlights(
  supabase: SupabaseClient,
  bookId: string,
  onInsert: (highlight: HighlightRow) => void
): RealtimeChannel {
  return supabase
    .channel(`highlights:${bookId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'highlights',
      filter: `book_id=eq.${bookId}`,
    }, payload => {
      const h = payload.new as HighlightRow
      if (h.visibility === 'public') onInsert(h)
    })
    .subscribe()
}
```

- [ ] **Step 4：运行测试确认通过**

```bash
npm test -- highlights.test.ts
```
预期：PASS

- [ ] **Step 5：创建 HighlightMenu 组件**

创建 `components/reader/HighlightMenu.tsx`：
```typescript
'use client'

import { useState, type RefObject } from 'react'
import type { Rendition } from 'epubjs'
import { useReaderStore } from '@/stores/reader'
import { createClient } from '@/lib/supabase/client'
import { insertHighlight, type HighlightColor } from '@/lib/supabase/highlights'
import { Button } from '@/components/ui/button'

const COLORS: { value: HighlightColor; label: string; bg: string }[] = [
  { value: 'yellow', label: '黄', bg: 'bg-yellow-200' },
  { value: 'red',    label: '红', bg: 'bg-red-200' },
  { value: 'blue',   label: '蓝', bg: 'bg-blue-200' },
  { value: 'green',  label: '绿', bg: 'bg-green-200' },
]

export function HighlightMenu({
  bookId,
  rendition,
}: {
  bookId: string
  rendition: RefObject<Rendition | null>
}) {
  const { showHighlightMenu, selectedCfi, selectedText, currentChapterId, closeHighlightMenu } =
    useReaderStore()
  const [color, setColor] = useState<HighlightColor>('yellow')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  if (!showHighlightMenu || !selectedCfi) return null

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)

    // 乐观渲染：在 epub 上先显示高亮
    const colorMap: Record<HighlightColor, string> = {
      yellow: '#fef08a', red: '#fca5a5', blue: '#93c5fd', green: '#86efac',
    }
    rendition.current?.annotations.add(
      'highlight', selectedCfi, {},
      undefined,
      'hl',
      { fill: colorMap[color], 'fill-opacity': '0.4' }
    )

    await insertHighlight(supabase, {
      userId: user.id,
      bookId,
      chapterId: currentChapterId,
      cfiRange: selectedCfi,
      text: selectedText ?? '',
      color,
      note,
      visibility: 'public',
    })

    setNote('')
    setSaving(false)
    closeHighlightMenu()
  }

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50
      bg-white border border-[--border] rounded-xl shadow-lg p-4 w-72">
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">「{selectedText}」</p>
      {/* 颜色选择 */}
      <div className="flex gap-2 mb-3">
        {COLORS.map(c => (
          <button key={c.value}
            onClick={() => setColor(c.value)}
            className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center
              transition-transform ${color === c.value ? 'scale-125 ring-2 ring-offset-1 ring-[--ink]' : ''}`}>
            <span className="text-xs">{c.label}</span>
          </button>
        ))}
      </div>
      {/* 批注 */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="添加批注（可选）"
        className="w-full h-16 text-sm border border-[--border] rounded-lg p-2
          resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
      />
      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={closeHighlightMenu}>
          取消
        </Button>
        <Button size="sm" className="flex-1 bg-[--ink] text-[--paper]"
          onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存标注'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6：创建 HighlightLayer（他人标注实时叠加）**

创建 `components/reader/HighlightLayer.tsx`：
```typescript
'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { Rendition } from 'epubjs'
import { createClient } from '@/lib/supabase/client'
import { fetchChapterHighlights, subscribeToHighlights, type HighlightRow } from '@/lib/supabase/highlights'
import { useReaderStore } from '@/stores/reader'

const colorMap: Record<string, string> = {
  yellow: '#fef08a', red: '#fca5a5', blue: '#93c5fd', green: '#86efac',
}

export function HighlightLayer({
  bookId,
  rendition,
}: {
  bookId: string
  rendition: RefObject<Rendition | null>
}) {
  const { currentChapterId } = useReaderStore()
  const [highlights, setHighlights] = useState<HighlightRow[]>([])
  const supabase = createClient()

  // 加载当前章节标注
  useEffect(() => {
    fetchChapterHighlights(supabase, bookId, currentChapterId).then(data => {
      setHighlights(data)
    })
  }, [bookId, currentChapterId])

  // 订阅新标注
  useEffect(() => {
    const channel = subscribeToHighlights(supabase, bookId, newHighlight => {
      setHighlights(prev => [newHighlight, ...prev])
      // 实时在 epub 中渲染他人标注（半透明）
      rendition.current?.annotations.add(
        'highlight', newHighlight.cfi_range, {},
        undefined, 'hl-others',
        { fill: colorMap[newHighlight.color], 'fill-opacity': '0.2' }
      )
    })
    return () => { supabase.removeChannel(channel) }
  }, [bookId])

  // 渲染已有标注
  useEffect(() => {
    if (!rendition.current) return
    highlights.forEach(h => {
      rendition.current?.annotations.add(
        'highlight', h.cfi_range, {},
        undefined, 'hl-others',
        { fill: colorMap[h.color], 'fill-opacity': '0.2' }
      )
    })
  }, [highlights])

  return null // 纯逻辑组件，无 UI
}
```

- [ ] **Step 7：在 EpubReader 中集成 HighlightLayer**

编辑 `components/reader/EpubReader.tsx`，在 return 中添加 HighlightLayer：
```typescript
// 在 import 部分添加
import { HighlightLayer } from './HighlightLayer'

// 在 JSX 中 <div ref={containerRef}> 同级添加
<HighlightLayer bookId={bookId} rendition={renditionRef} />
```

- [ ] **Step 8：全量测试**

```bash
npm test
```
预期：所有测试 PASS

- [ ] **Step 9：提交**

```bash
git add .
git commit -m "feat: add highlight annotation with realtime overlay from other readers"
```

---

## 自审

| 检查项 | 结果 |
|---|---|
| 规格覆盖 | ✅ M1（书库列表/详情/分类/搜索）、M2（阅读器/高亮4色/批注/Realtime叠加/主题/字体） |
| 占位符扫描 | ✅ 无 TBD/TODO |
| 类型一致性 | ✅ `HighlightRow` 在 highlights.ts 定义，HighlightMenu/HighlightLayer 均使用同一类型 |
| CFI 一致性 | ✅ `cfi_range` 字段名在 DB/插入/查询/渲染全链路一致 |
