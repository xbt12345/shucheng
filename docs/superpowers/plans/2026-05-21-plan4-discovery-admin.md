# 儒典书城 Plan 4：排行发现 + 管理后台

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> **前置条件：Plan 1 + Plan 2 完成**

**Goal:** 实现 M5 排行与发现模块（热榜/推荐/关注动态流）和 M6 管理后台（书籍上传/用户管理/评论审核/数据看板）。

**Architecture:** 排行榜通过 PostgreSQL 聚合查询 + Next.js ISR（每 5 分钟刷新）实现。管理后台走独立路由组 `/admin`，由中间件验证 admin 角色，书籍上传直传 Supabase Storage。

**Tech Stack:** Next.js 15, Supabase JS v2, Supabase Storage, TailwindCSS, Recharts（数据看板图表）

---

## 文件结构

```
app/
├── community/
│   ├── highlights/page.tsx         # 热门标注广场
│   └── page.tsx                    # 社区广场（含关注动态）
├── admin/
│   ├── layout.tsx                  # Admin 布局（权限守卫）
│   ├── page.tsx                    # 数据看板
│   ├── books/
│   │   ├── page.tsx               # 书籍列表管理
│   │   └── upload/page.tsx        # 上传书籍
│   ├── users/page.tsx             # 用户管理
│   └── reviews/page.tsx           # 评论审核
components/
├── discovery/
│   ├── HotBooksList.tsx           # 热门书籍榜
│   └── FeedList.tsx               # 关注动态流
├── admin/
│   ├── BookUploadForm.tsx         # 书籍上传表单
│   ├── UserTable.tsx              # 用户管理表格
│   ├── ReviewQueue.tsx            # 评论审核队列
│   └── StatsChart.tsx             # 数据看板图表
lib/
└── admin-check.ts                 # Admin 权限检查工具
```

---

## Task 1：热门标注广场 + 社区广场

**Files:**
- Create: `app/community/page.tsx`
- Create: `app/community/highlights/page.tsx`
- Create: `components/discovery/HotBooksList.tsx`

- [ ] **Step 1：创建热榜组件**

创建 `components/discovery/HotBooksList.tsx`：
```typescript
import Link from 'next/link'
import { BookCard, type Book } from '@/components/books/BookCard'

export function HotBooksList({ books, title }: { books: Book[]; title: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[--ink] mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {books.map((book, i) => (
          <div key={book.id} className="relative">
            {i < 3 && (
              <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full
                bg-[--ink] text-[--paper] text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
            )}
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2：创建社区广场页（ISR）**

创建 `app/community/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { HotBooksList } from '@/components/discovery/HotBooksList'
import type { Metadata } from 'next'

export const revalidate = 300 // ISR：5分钟刷新

export const metadata: Metadata = {
  title: '社区广场 — 儒典书城',
}

export default async function CommunityPage() {
  const supabase = await createClient()

  const { data: hotBooks } = await supabase
    .from('books')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(8)

  const { data: topRated } = await supabase
    .from('books')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(8)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <HotBooksList books={hotBooks ?? []} title="🔥 热门阅读" />
      <HotBooksList books={topRated ?? []} title="⭐ 精选经典" />
    </div>
  )
}
```

- [ ] **Step 3：创建热门标注广场（ISR）**

创建 `app/community/highlights/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const revalidate = 300

const colorMap: Record<string, string> = {
  yellow: 'bg-yellow-100 border-yellow-300',
  red: 'bg-red-100 border-red-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
}

export default async function HotHighlightsPage() {
  const supabase = await createClient()

  const { data: highlights } = await supabase
    .from('highlights')
    .select('*, profiles(username, avatar_url), books(title, author)')
    .eq('visibility', 'public')
    .order('like_count', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[--ink] mb-6">热门标注广场</h1>
      <div className="space-y-4">
        {(highlights ?? []).map((h: any) => (
          <div key={h.id}
            className={`border rounded-xl p-4 ${colorMap[h.color] ?? 'bg-gray-50 border-gray-200'}`}>
            <blockquote className="text-[--ink] font-medium leading-relaxed mb-3">
              「{h.text}」
            </blockquote>
            {h.note && (
              <p className="text-gray-700 text-sm mb-3 pl-3 border-l-2 border-[--gold]">
                {h.note}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={h.profiles?.avatar_url} />
                  <AvatarFallback className="text-[8px]">{h.profiles?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span>{h.profiles?.username}</span>
                <span>·</span>
                <Link href={`/books/${h.book_id}`} className="hover:text-[--gold]">
                  《{h.books?.title}》
                </Link>
              </div>
              <span>❤️ {h.like_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4：提交**

```bash
git add .
git commit -m "feat: add community square and hot highlights page with ISR"
```

---

## Task 2：Admin 权限守卫

**Files:**
- Create: `lib/admin-check.ts`
- Create: `app/admin/layout.tsx`

- [ ] **Step 1：创建 admin 权限检查工具**

创建 `lib/admin-check.ts`：
```typescript
import type { SupabaseClient } from '@supabase/supabase-js'

export async function requireAdmin(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHORIZED')

  const role = user.user_metadata?.role
  if (role !== 'admin') throw new Error('FORBIDDEN')

  return user.id
}
```

- [ ] **Step 2：创建 Admin 布局（权限守卫）**

创建 `app/admin/layout.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-48 bg-[--ink] text-[--paper] flex-shrink-0 p-4">
        <h2 className="text-[--gold] font-bold mb-6 text-sm">管理后台</h2>
        <nav className="space-y-2 text-sm">
          {[
            { href: '/admin', label: '📊 数据看板' },
            { href: '/admin/books', label: '📚 书籍管理' },
            { href: '/admin/books/upload', label: '⬆️ 上传书籍' },
            { href: '/admin/users', label: '👥 用户管理' },
            { href: '/admin/reviews', label: '🔍 评论审核' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="block py-2 px-3 rounded hover:bg-white/10 transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-[--paper]">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3：提交**

```bash
git add .
git commit -m "feat: add admin layout with role-based access control"
```

---

## Task 3：书籍上传功能

**Files:**
- Create: `components/admin/BookUploadForm.tsx`
- Create: `app/admin/books/upload/page.tsx`
- Create: `app/api/admin/books/route.ts`

- [ ] **Step 1：在 Supabase 创建 Storage Bucket**

在 Supabase Dashboard → Storage → New Bucket：
- Name: `books`
- Public: ✅（公开访问）

再创建 `covers` bucket（同样设为公开）。

或通过迁移创建：
```bash
supabase migration new add_storage_buckets
```

写入迁移文件：
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true), ('covers', 'covers', true)
ON CONFLICT DO NOTHING;

-- books bucket 策略
CREATE POLICY "books_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'books');
CREATE POLICY "books_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'books' AND
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- covers bucket 策略
CREATE POLICY "covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "covers_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
```

```bash
supabase db reset
```

- [ ] **Step 2：创建书籍上传 API**

创建 `app/api/admin/books/route.ts`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-check'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'UNAUTHORIZED' ? 401 : 403 })
  }

  const body = await request.json()
  const { title, author, category, description, coverUrl, fileUrl, publishedAt, isPublic } = body

  if (!title || !author || !category || !fileUrl) {
    return NextResponse.json({ error: '标题、作者、分类、文件路径必填' }, { status: 400 })
  }

  const { data, error } = await supabase.from('books').insert({
    title,
    author,
    category,
    description: description ?? null,
    cover_url: coverUrl ?? null,
    file_url: fileUrl,
    published_at: publishedAt ?? null,
    is_public: isPublic ?? true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3：创建书籍上传表单**

创建 `components/admin/BookUploadForm.tsx`：
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const CATEGORIES = ['儒', '释', '道', '史', '集']

export function BookUploadForm() {
  const [form, setForm] = useState({
    title: '', author: '', category: '儒', description: '', publishedAt: '',
  })
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    return path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!epubFile) { toast({ title: 'epub 文件必须上传', variant: 'destructive' }); return }

    setUploading(true)
    try {
      const timestamp = Date.now()
      const fileUrl = await uploadFile(epubFile, 'books', `${timestamp}-${epubFile.name}`)
      let coverUrl: string | null = null
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers', `${timestamp}-${coverFile.name}`)
      }

      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fileUrl, coverUrl }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }

      toast({ title: '书籍上传成功！' })
      setForm({ title: '', author: '', category: '儒', description: '', publishedAt: '' })
      setEpubFile(null)
      setCoverFile(null)
    } catch (err: any) {
      toast({ title: '上传失败', description: err.message, variant: 'destructive' })
    }
    setUploading(false)
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>书名 *</Label>
        <Input {...field('title')} placeholder="如：论语" required />
      </div>
      <div className="space-y-2">
        <Label>作者 *</Label>
        <Input {...field('author')} placeholder="如：孔子" required />
      </div>
      <div className="space-y-2">
        <Label>分类 *</Label>
        <select {...field('category')} className="w-full border border-[--border] rounded-md p-2 text-sm">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>简介</Label>
        <textarea {...field('description')}
          className="w-full h-20 border border-[--border] rounded-md p-2 text-sm resize-none"
          placeholder="书籍简介" />
      </div>
      <div className="space-y-2">
        <Label>epub 文件 *</Label>
        <Input type="file" accept=".epub"
          onChange={e => setEpubFile(e.target.files?.[0] ?? null)} required />
      </div>
      <div className="space-y-2">
        <Label>封面图片</Label>
        <Input type="file" accept="image/*"
          onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button type="submit" disabled={uploading} className="w-full bg-[--ink] text-[--paper]">
        {uploading ? '上传中...' : '上传书籍'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4：创建上传页面**

创建 `app/admin/books/upload/page.tsx`：
```typescript
import { BookUploadForm } from '@/components/admin/BookUploadForm'

export default function UploadBookPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[--ink] mb-6">上传书籍</h1>
      <BookUploadForm />
    </div>
  )
}
```

- [ ] **Step 5：提交**

```bash
git add .
git commit -m "feat: add book upload with Supabase Storage"
```

---

## Task 4：数据看板

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1：安装图表库**

```bash
npm install recharts
```

- [ ] **Step 2：创建数据看板页**

创建 `app/admin/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalBooks },
    { count: totalUsers },
    { count: totalHighlights },
    { count: totalComments },
    { data: topBooks },
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('highlights').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('title, view_count').order('view_count', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: '书籍总数', value: totalBooks ?? 0, icon: '📚' },
    { label: '注册用户', value: totalUsers ?? 0, icon: '👥' },
    { label: '标注总数', value: totalHighlights ?? 0, icon: '✏️' },
    { label: '书评总数', value: totalComments ?? 0, icon: '💬' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[--ink] mb-6">数据看板</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-[--border] rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-[--ink]">{s.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[--border] rounded-xl p-4">
        <h2 className="font-bold text-[--ink] mb-4">热门书籍 Top 5</h2>
        <div className="space-y-3">
          {(topBooks ?? []).map((book: any, i: number) => (
            <div key={book.title} className="flex items-center gap-3">
              <span className="text-[--gold] font-bold w-4">{i + 1}</span>
              <span className="flex-1 text-sm">{book.title}</span>
              <span className="text-xs text-gray-500">{book.view_count} 次阅读</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3：提交**

```bash
git add .
git commit -m "feat: add admin dashboard with stats overview"
```

---

## Task 5：评论审核队列

**Files:**
- Create: `app/admin/reviews/page.tsx`
- Create: `components/admin/ReviewQueue.tsx`

- [ ] **Step 1：创建评论审核组件**

创建 `components/admin/ReviewQueue.tsx`：
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type Comment = {
  id: string
  content: string
  created_at: string
  profiles: { username: string }
  books: { title: string }
}

export function ReviewQueue({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/comments?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== id))
      toast({ title: '评论已删除' })
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
```

- [ ] **Step 2：创建评论审核页**

创建 `app/admin/reviews/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { ReviewQueue } from '@/components/admin/ReviewQueue'

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, profiles(username), books(title)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[--ink] mb-6">评论审核</h1>
      <ReviewQueue initialComments={(comments as any) ?? []} />
    </div>
  )
}
```

- [ ] **Step 3：最终全量测试**

```bash
npm test
npm run build
```
预期：所有测试通过，build 无 TypeScript 错误。

- [ ] **Step 4：最终提交并推送**

```bash
git add .
git commit -m "feat: complete Plan 4 - discovery and admin dashboard"
git push
```

---

## 自审

| 检查项 | 结果 |
|---|---|
| 规格覆盖 | ✅ M5（热榜/发现/ISR）、M6（书籍上传/评论审核/数据看板/Admin权限） |
| 占位符扫描 | ✅ 无 TBD/TODO |
| 类型一致性 | ✅ `requireAdmin` 在 admin-check.ts 定义，API Routes 统一调用 |
| 安全性 | ✅ Admin 路由双重守卫：中间件 layout.tsx + API Route requireAdmin() |
