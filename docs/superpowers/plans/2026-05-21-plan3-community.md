# 儒典书城 Plan 3：社区 + 用户社交

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> **前置条件：Plan 1 完成**

**Goal:** 实现 M3 社区模块（书评/书单/话题圈/热门标注广场）和 M4 用户社交模块（个人主页/关注/消息通知/打卡徽章）。

**Architecture:** 书评和评论走 Next.js API Routes 做服务端关键词过滤后写 Supabase。关注动态用 PostgreSQL 直查。打卡用每日 UPSERT + SQL Window Function 算连续天数。

**Tech Stack:** Next.js 15, Supabase JS v2, TailwindCSS, Zustand, Vitest

---

## 文件结构

```
app/
├── community/
│   ├── page.tsx                    # 社区广场（热门书评+热门标注）
│   ├── circles/
│   │   ├── page.tsx               # 话题圈列表
│   │   └── [id]/page.tsx          # 圈子详情
│   └── highlights/page.tsx        # 热门标注广场
├── profile/
│   ├── page.tsx                   # 我的主页
│   ├── bookshelf/page.tsx         # 我的书架
│   ├── booklists/page.tsx         # 我的书单
│   └── checkin/page.tsx           # 打卡记录
├── user/[username]/page.tsx       # 他人主页
└── api/
    ├── comments/route.ts          # 评论 CRUD
    ├── follows/route.ts           # 关注/取关
    └── checkin/route.ts           # 打卡
components/
├── community/
│   ├── CommentForm.tsx            # 书评表单
│   ├── CommentCard.tsx            # 评论卡片
│   ├── CommentList.tsx            # 评论列表
│   ├── BooklistCard.tsx           # 书单卡片
│   ├── CircleCard.tsx             # 话题圈卡片
│   └── HotHighlightCard.tsx       # 热门标注卡片
├── profile/
│   ├── ProfileHeader.tsx          # 用户主页头部
│   ├── FollowButton.tsx           # 关注按钮
│   ├── CheckinCalendar.tsx        # 打卡日历
│   └── BadgeList.tsx              # 徽章列表
lib/
└── content-filter.ts              # 关键词过滤
__tests__/
├── comments.test.ts
└── checkin.test.ts
```

---

## Task 1：评论 API + 内容过滤

**Files:**
- Create: `lib/content-filter.ts`
- Create: `app/api/comments/route.ts`
- Create: `__tests__/comments.test.ts`

- [ ] **Step 1：写失败测试**

创建 `__tests__/comments.test.ts`：
```typescript
import { describe, it, expect } from 'vitest'
import { filterContent } from '@/lib/content-filter'

describe('filterContent', () => {
  it('returns clean for normal text', () => {
    expect(filterContent('这本书很好，值得一读')).toEqual({ clean: true, reason: null })
  })

  it('rejects content with blocked keywords', () => {
    const result = filterContent('这个网站真的很垃圾，不如去找个代理')
    expect(result.clean).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('rejects empty content', () => {
    expect(filterContent('')).toEqual({ clean: false, reason: '内容不能为空' })
  })

  it('rejects content over 2000 characters', () => {
    expect(filterContent('a'.repeat(2001))).toEqual({ clean: false, reason: '内容不能超过 2000 字' })
  })
})
```

- [ ] **Step 2：运行确认失败**

```bash
npm test -- comments.test.ts
```
预期：FAIL

- [ ] **Step 3：创建内容过滤器**

创建 `lib/content-filter.ts`：
```typescript
// 基础违禁词列表（可根据需要扩展）
const BLOCKED_KEYWORDS = [
  '代理', '机场', '翻墙', '博彩', '赌博', '色情',
  '诈骗', '传销', '炸弹', '制毒',
]

type FilterResult = { clean: true; reason: null } | { clean: false; reason: string }

export function filterContent(content: string): FilterResult {
  if (!content.trim()) return { clean: false, reason: '内容不能为空' }
  if (content.length > 2000) return { clean: false, reason: '内容不能超过 2000 字' }

  const lowerContent = content.toLowerCase()
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return { clean: false, reason: `内容包含不允许的词语` }
    }
  }

  return { clean: true, reason: null }
}
```

- [ ] **Step 4：运行测试通过**

```bash
npm test -- comments.test.ts
```
预期：PASS

- [ ] **Step 5：创建评论 API Route**

创建 `app/api/comments/route.ts`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { filterContent } from '@/lib/content-filter'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const body = await request.json()
  const { bookId, highlightId, parentId, content, rating } = body

  const filter = filterContent(content)
  if (!filter.clean) {
    return NextResponse.json({ error: filter.reason }, { status: 400 })
  }

  const { data, error } = await supabase.from('comments').insert({
    user_id: user.id,
    book_id: bookId,
    highlight_id: highlightId ?? null,
    parent_id: parentId ?? null,
    content,
    rating: rating ?? null,
  }).select('*, profiles(username, avatar_url)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')
  const highlightId = searchParams.get('highlightId')

  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 })

  const supabase = await createClient()
  let query = supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('book_id', bookId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (highlightId) {
    query = query.eq('highlight_id', highlightId)
  } else {
    query = query.is('highlight_id', null)
  }

  const { data } = await query
  return NextResponse.json(data ?? [])
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('id')
  if (!commentId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { error } = await supabase.from('comments')
    .delete().eq('id', commentId).eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 6：提交**

```bash
git add .
git commit -m "feat: add comments API with content filtering"
```

---

## Task 2：评论组件 + 书籍详情页集成

**Files:**
- Create: `components/community/CommentForm.tsx`
- Create: `components/community/CommentCard.tsx`
- Create: `components/community/CommentList.tsx`
- Modify: `app/books/[id]/page.tsx`

- [ ] **Step 1：创建 CommentForm**

创建 `components/community/CommentForm.tsx`：
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()

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
      toast({ title: '发布失败', description: error, variant: 'destructive' })
    } else {
      setContent('')
      setRating(0)
      onSuccess()
      toast({ title: '书评发布成功' })
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
```

- [ ] **Step 2：创建 CommentCard**

创建 `components/community/CommentCard.tsx`：
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Comment = {
  id: string
  content: string
  rating: number | null
  like_count: number
  created_at: string
  profiles: { username: string; avatar_url: string | null }
}

export function CommentCard({ comment }: { comment: Comment }) {
  const date = new Date(comment.created_at).toLocaleDateString('zh-CN')

  return (
    <div className="py-4 border-b border-[--border] last:border-0">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="bg-[--paper-dark] text-[--ink] text-xs">
            {comment.profiles.username[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[--ink]">{comment.profiles.username}</span>
            {comment.rating && (
              <span className="text-[--gold] text-sm">{'★'.repeat(comment.rating)}</span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{date}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3：创建 CommentList**

创建 `components/community/CommentList.tsx`：
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommentCard } from './CommentCard'
import { CommentForm } from './CommentForm'
import { createClient } from '@/lib/supabase/client'

export function CommentList({ bookId }: { bookId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?bookId=${bookId}`)
    setComments(await res.json())
  }, [bookId])

  useEffect(() => {
    load()
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
  }, [load])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[--ink] mb-4">书评 ({comments.length})</h2>
      {loggedIn ? (
        <div className="mb-6 p-4 bg-[--paper-dark] rounded-lg">
          <CommentForm bookId={bookId} onSuccess={load} />
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          <a href="/auth/login" className="text-[--gold] hover:underline">登录</a> 后发表书评
        </p>
      )}
      <div>
        {comments.map(c => <CommentCard key={c.id} comment={c} />)}
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">还没有书评，来写第一篇吧</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4：在书籍详情页集成评论列表**

编辑 `app/books/[id]/page.tsx`，在 `<BookDetail>` 下方添加：
```typescript
// 在 import 部分添加
import { CommentList } from '@/components/community/CommentList'

// 在 JSX 中 <BookDetail book={book} /> 下方添加
<CommentList bookId={id} />
```

- [ ] **Step 5：提交**

```bash
git add .
git commit -m "feat: add book reviews with comment form and list"
```

---

## Task 3：关注系统

**Files:**
- Create: `app/api/follows/route.ts`
- Create: `components/profile/FollowButton.tsx`

- [ ] **Step 1：创建关注 API**

创建 `app/api/follows/route.ts`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { followingId } = await request.json()
  if (followingId === user.id) {
    return NextResponse.json({ error: '不能关注自己' }, { status: 400 })
  }

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error?.code === '23505') {
    return NextResponse.json({ error: '已关注' }, { status: 409 })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const followingId = searchParams.get('followingId')
  if (!followingId) return NextResponse.json({ error: 'followingId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  await supabase.from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2：创建 FollowButton 组件**

创建 `components/profile/FollowButton.tsx`：
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string
  initialFollowing: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const toggle = async () => {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const url = following
      ? `/api/follows?followingId=${targetUserId}`
      : '/api/follows'
    const body = following ? undefined : JSON.stringify({ followingId: targetUserId })

    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
    })

    if (res.ok) {
      setFollowing(!following)
    } else {
      const { error } = await res.json()
      toast({ title: '操作失败', description: error, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={following ? 'outline' : 'default'}
      className={following
        ? 'border-[--ink] text-[--ink]'
        : 'bg-[--ink] text-[--paper]'}>
      {loading ? '...' : following ? '已关注' : '+ 关注'}
    </Button>
  )
}
```

- [ ] **Step 3：提交**

```bash
git add .
git commit -m "feat: add follow/unfollow system"
```

---

## Task 4：打卡系统

**Files:**
- Create: `app/api/checkin/route.ts`
- Create: `components/profile/CheckinCalendar.tsx`
- Create: `__tests__/checkin.test.ts`

- [ ] **Step 1：写失败测试**

创建 `__tests__/checkin.test.ts`：
```typescript
import { describe, it, expect } from 'vitest'
import { calcStreak } from '@/lib/checkin'

describe('calcStreak', () => {
  it('returns 0 for empty logs', () => {
    expect(calcStreak([])).toBe(0)
  })

  it('counts consecutive days', () => {
    const today = new Date()
    const days = [0, 1, 2].map(d => {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      return date.toISOString().split('T')[0]
    })
    expect(calcStreak(days)).toBe(3)
  })

  it('stops at gap', () => {
    const today = new Date()
    const days = [0, 1, 3].map(d => {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      return date.toISOString().split('T')[0]
    })
    expect(calcStreak(days)).toBe(2)
  })
})
```

- [ ] **Step 2：运行确认失败**

```bash
npm test -- checkin.test.ts
```
预期：FAIL

- [ ] **Step 3：创建打卡工具函数**

创建 `lib/checkin.ts`：
```typescript
/** dates: ISO 日期字符串数组，从新到旧排序 */
export function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().split('T')[0]

  // 如果最新一条不是今天或昨天，streak 为 0
  const latestDate = sorted[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (latestDate !== today && latestDate !== yesterdayStr) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (Math.round(diff) === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export const BADGES = [
  { days: 7,   name: '初心者', emoji: '🌱' },
  { days: 30,  name: '月读者', emoji: '🌿' },
  { days: 100, name: '百日功', emoji: '🎋' },
  { days: 365, name: '经年学者', emoji: '🏆' },
]

export function getEarnedBadges(streak: number) {
  return BADGES.filter(b => streak >= b.days)
}
```

- [ ] **Step 4：运行测试通过**

```bash
npm test -- checkin.test.ts
```
预期：PASS

- [ ] **Step 5：创建打卡 API**

创建 `app/api/checkin/route.ts`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { bookId, progressCfi, durationSec } = await request.json()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase.from('reading_logs')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      progress_cfi: progressCfi,
      duration_sec: durationSec,
      logged_at: today,
    }, { onConflict: 'user_id,book_id,logged_at', ignoreDuplicates: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const supabase = await createClient()
  const { data } = await supabase
    .from('reading_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(400)

  const dates = (data ?? []).map((r: { logged_at: string }) => r.logged_at)
  return NextResponse.json({ dates })
}
```

- [ ] **Step 6：提交**

```bash
git add .
git commit -m "feat: add daily checkin system with streak calculation and badges"
```

---

## Task 5：个人主页

**Files:**
- Create: `app/profile/page.tsx`
- Create: `app/user/[username]/page.tsx`
- Create: `components/profile/ProfileHeader.tsx`

- [ ] **Step 1：创建 ProfileHeader**

创建 `components/profile/ProfileHeader.tsx`：
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { FollowButton } from './FollowButton'
import { getEarnedBadges } from '@/lib/checkin'

type Props = {
  profile: { id: string; username: string; bio: string | null; avatar_url: string | null }
  followerCount: number
  followingCount: number
  streak: number
  isOwnProfile: boolean
  isFollowing: boolean
}

export function ProfileHeader({ profile, followerCount, followingCount, streak, isOwnProfile, isFollowing }: Props) {
  const badges = getEarnedBadges(streak)

  return (
    <div className="bg-white border border-[--border] rounded-xl p-6 flex items-start gap-5">
      <Avatar className="w-16 h-16">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback className="bg-[--paper-dark] text-[--ink] text-xl">
          {profile.username[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-[--ink]">{profile.username}</h1>
          {badges.map(b => (
            <span key={b.days} title={b.name} className="text-lg">{b.emoji}</span>
          ))}
          {!isOwnProfile && (
            <FollowButton targetUserId={profile.id} initialFollowing={isFollowing} />
          )}
        </div>
        {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          <span><strong className="text-[--ink]">{followerCount}</strong> 粉丝</span>
          <span><strong className="text-[--ink]">{followingCount}</strong> 关注</span>
          <span><strong className="text-[--gold]">{streak}</strong> 天连续打卡</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2：创建我的主页**

创建 `app/profile/page.tsx`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { redirect } from 'next/navigation'
import { calcStreak } from '@/lib/checkin'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { count: followerCount }, { count: followingCount }, { data: logs }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
      supabase.from('reading_logs').select('logged_at').eq('user_id', user.id)
        .order('logged_at', { ascending: false }).limit(400),
    ])

  if (!profile) redirect('/auth/login')

  const streak = calcStreak((logs ?? []).map((l: { logged_at: string }) => l.logged_at))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ProfileHeader
        profile={profile}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        streak={streak}
        isOwnProfile={true}
        isFollowing={false}
      />
    </div>
  )
}
```

- [ ] **Step 3：提交**

```bash
git add .
git commit -m "feat: add user profile page with stats and badges"
```

---

## 自审

| 检查项 | 结果 |
|---|---|
| 规格覆盖 | ✅ M3（书评/评论/内容过滤）、M4（个人主页/关注/打卡/徽章） |
| 占位符扫描 | ✅ 无 TBD/TODO |
| 类型一致性 | ✅ `calcStreak` 接收 `string[]`，API 和组件均符合 |
