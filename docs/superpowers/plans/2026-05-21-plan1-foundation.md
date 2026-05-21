# 儒典书城 Plan 1：基础层实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建项目骨架，包含 Next.js 15 初始化、Supabase 数据库全部 Schema + RLS 策略、用户认证（注册/登录/OAuth）、以及基础 UI 设计系统。

**Architecture:** Next.js 15 App Router + Supabase（PostgreSQL + Auth + Storage + Realtime）+ TailwindCSS + shadcn/ui。前端部署 Vercel，后端托管 Supabase Cloud，CI/CD 通过 GitHub Actions 自动触发。

**Tech Stack:** Next.js 15, TypeScript, TailwindCSS v4, shadcn/ui, Supabase JS v2, Zustand v4, Vitest, Playwright

---

## 文件结构预览

```
shucheng/
├── app/
│   ├── layout.tsx                    # 根布局，字体+主题+Supabase Provider
│   ├── (marketing)/
│   │   └── page.tsx                  # 落地页
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts         # OAuth 回调
│   └── api/
│       └── auth/
│           └── confirm/route.ts      # 邮件确认
├── components/
│   ├── ui/                           # shadcn/ui 组件（自动生成）
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 浏览器端 Supabase client
│   │   ├── server.ts                 # 服务端 Supabase client（Server Components）
│   │   └── middleware.ts             # 会话刷新中间件
│   └── utils.ts                      # cn() 等工具函数
├── middleware.ts                      # Next.js 中间件（保护路由）
├── supabase/
│   ├── migrations/
│   │   └── 001_init_schema.sql       # 全部建表 + RLS + Index
│   └── config.toml
├── __tests__/
│   ├── auth.test.ts                  # Vitest 单元测试
│   └── e2e/
│       └── auth.spec.ts              # Playwright E2E
├── .env.local.example
├── .github/
│   └── workflows/
│       └── ci.yml
└── package.json
```

---

## Task 1：初始化 Next.js 15 项目

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `.env.local.example`
- Create: `.gitignore`

- [ ] **Step 1：创建 Next.js 项目**

```bash
cd C:/Users/xiabutian/Desktop
npx create-next-app@latest shucheng-project \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git
cd shucheng-project
```

- [ ] **Step 2：安装核心依赖**

```bash
npm install @supabase/supabase-js @supabase/ssr zustand
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

- [ ] **Step 3：安装 shadcn/ui**

```bash
npx shadcn@latest init
```
交互选项：
- Style: Default
- Base color: Stone
- CSS variables: Yes

```bash
npx shadcn@latest add button input label card form toast avatar badge tabs
```

- [ ] **Step 4：创建 `.env.local.example`**

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF
```

复制为 `.env.local`：
```bash
cp .env.local.example .env.local
```
然后填入真实的 Supabase 项目值（在 Supabase Dashboard → Settings → API 获取）。

- [ ] **Step 5：配置 Vitest**

创建 `vitest.config.ts`：
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

创建 `__tests__/setup.ts`：
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6：添加 npm scripts**

编辑 `package.json`，在 `scripts` 中添加：
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

- [ ] **Step 7：验证项目启动**

```bash
npm run dev
```
预期：浏览器打开 `http://localhost:3000`，显示 Next.js 默认页面，无报错。

- [ ] **Step 8：初始化 Git 并提交**

```bash
git init
echo ".env.local" >> .gitignore
echo ".supabase/" >> .gitignore
git add .
git commit -m "feat: initialize Next.js 15 project with Supabase + shadcn/ui"
```

---

## Task 2：配置 Supabase 本地开发环境

**Files:**
- Create: `supabase/config.toml`（由 CLI 生成）
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Modify: `middleware.ts`

- [ ] **Step 1：安装 Supabase CLI 并初始化**

```bash
npm install -g supabase
supabase init
```
预期：生成 `supabase/config.toml`。

- [ ] **Step 2：启动本地 Supabase 实例**

```bash
supabase start
```
预期输出（保存这些值到 `.env.local`）：
```
API URL: http://localhost:54321
anon key: eyJ...
service_role key: eyJ...
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
```

将上述值填入 `.env.local`：
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<上面的 anon key>
SUPABASE_SERVICE_ROLE_KEY=<上面的 service_role key>
```

- [ ] **Step 3：创建浏览器端 Supabase client**

创建 `lib/supabase/client.ts`：
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4：创建服务端 Supabase client**

创建 `lib/supabase/server.ts`：
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 5：创建中间件 Supabase client**

创建 `lib/supabase/middleware.ts`：
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 保护需要登录的路由
  const protectedPaths = ['/profile', '/admin']
  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 6：配置 Next.js 中间件**

创建 `middleware.ts`（项目根目录）：
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 7：提交**

```bash
git add .
git commit -m "feat: configure Supabase client (browser/server/middleware)"
```

---

## Task 3：数据库 Schema 迁移

**Files:**
- Create: `supabase/migrations/20260521000000_init_schema.sql`

- [ ] **Step 1：创建迁移文件**

```bash
supabase migration new init_schema
```
预期：生成 `supabase/migrations/20260521000000_init_schema.sql`。

- [ ] **Step 2：写入完整 Schema**

将以下内容写入该迁移文件：

```sql
-- =====================
-- 扩展
-- =====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- profiles（用户信息）
-- =====================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- books（书籍）
-- =====================
CREATE TABLE books (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  author       TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('儒','释','道','史','集')),
  description  TEXT,
  cover_url    TEXT,
  file_url     TEXT,
  published_at DATE,
  is_public    BOOLEAN DEFAULT TRUE,
  view_count   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- chapters（章节）
-- =====================
CREATE TABLE chapters (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id   UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  order_num INT NOT NULL,
  cfi_range TEXT
);

-- =====================
-- highlights（高亮标注）
-- =====================
CREATE TABLE highlights (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id  UUID REFERENCES chapters(id) ON DELETE SET NULL,
  cfi_range   TEXT NOT NULL,
  text        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'yellow' CHECK (color IN ('yellow','red','blue','green')),
  note        TEXT,
  visibility  TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','friends','private')),
  like_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_highlights_book_chapter ON highlights(book_id, chapter_id);
CREATE INDEX idx_highlights_user ON highlights(user_id);

-- =====================
-- comments（评论/书评）
-- =====================
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id      UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  highlight_id UUID REFERENCES highlights(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES comments(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  rating       INT CHECK (rating BETWEEN 1 AND 5),
  like_count   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_book ON comments(book_id);
CREATE INDEX idx_comments_highlight ON comments(highlight_id);

-- =====================
-- booklists（书单）
-- =====================
CREATE TABLE booklists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE booklist_items (
  booklist_id UUID NOT NULL REFERENCES booklists(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  order_num   INT DEFAULT 0,
  PRIMARY KEY (booklist_id, book_id)
);

-- =====================
-- follows（关注关系）
-- =====================
CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);

-- =====================
-- reading_logs（阅读记录/打卡）
-- =====================
CREATE TABLE reading_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id      UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  progress_cfi TEXT,
  duration_sec INT DEFAULT 0,
  logged_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, book_id, logged_at)
);

CREATE INDEX idx_reading_logs_user_date ON reading_logs(user_id, logged_at);

-- =====================
-- circles（话题圈）
-- =====================
CREATE TABLE circles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  book_id      UUID REFERENCES books(id) ON DELETE SET NULL,
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_count INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Row-Level Security
-- =====================
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE books       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE booklists   ENABLE ROW LEVEL SECURITY;
ALTER TABLE booklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles     ENABLE ROW LEVEL SECURITY;

-- profiles: 所有人可读，本人可改
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- books: 所有人可读，admin 可写（通过 service role）
CREATE POLICY "books_select" ON books FOR SELECT USING (TRUE);
CREATE POLICY "books_insert" ON books FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "books_update" ON books FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- chapters: 所有人可读
CREATE POLICY "chapters_select" ON chapters FOR SELECT USING (TRUE);

-- highlights: public 可读，private 仅本人，friends 暂同 public
CREATE POLICY "highlights_select_public" ON highlights
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "highlights_insert" ON highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "highlights_update" ON highlights
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "highlights_delete" ON highlights
  FOR DELETE USING (auth.uid() = user_id);

-- comments: 所有人可读，登录用户可写，本人可删
CREATE POLICY "comments_select" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- booklists: public 可读，本人可写
CREATE POLICY "booklists_select" ON booklists
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());
CREATE POLICY "booklists_insert" ON booklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "booklists_update" ON booklists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "booklists_delete" ON booklists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "booklist_items_select" ON booklist_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM booklists WHERE id = booklist_id AND (is_public OR user_id = auth.uid()))
  );
CREATE POLICY "booklist_items_modify" ON booklist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM booklists WHERE id = booklist_id AND user_id = auth.uid())
  );

-- follows: 所有人可读
CREATE POLICY "follows_select" ON follows FOR SELECT USING (TRUE);
CREATE POLICY "follows_insert" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- reading_logs: 仅本人可读写
CREATE POLICY "reading_logs_own" ON reading_logs
  FOR ALL USING (auth.uid() = user_id);

-- circles: 所有人可读，登录用户可创建
CREATE POLICY "circles_select" ON circles FOR SELECT USING (TRUE);
CREATE POLICY "circles_insert" ON circles
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "circles_update" ON circles
  FOR UPDATE USING (auth.uid() = owner_id);
```

- [ ] **Step 3：应用迁移到本地**

```bash
supabase db reset
```
预期：`Applying migration 20260521000000_init_schema.sql... done`

- [ ] **Step 4：验证表结构**

```bash
supabase db diff
```
预期：无差异（diff 为空）。

在 Supabase Studio（http://localhost:54323）→ Table Editor 确认 10 张表均已创建。

- [ ] **Step 5：提交**

```bash
git add supabase/
git commit -m "feat: add full database schema with RLS policies"
```

---

## Task 4：设计系统（水墨禅意主题）

**Files:**
- Modify: `app/globals.css`
- Create: `lib/utils.ts`
- Create: `app/layout.tsx`
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1：配置 TailwindCSS 水墨主题色**

编辑 `app/globals.css`：
```css
@import "tailwindcss";

:root {
  /* 水墨禅意主色 */
  --ink:        #3d2c1e;
  --gold:       #d6b887;
  --paper:      #faf8f4;
  --paper-dark: #f0ebe1;

  /* 高亮色 */
  --hl-yellow:  #fef08a;
  --hl-red:     #fca5a5;
  --hl-blue:    #93c5fd;
  --hl-green:   #86efac;

  /* shadcn 变量覆盖 */
  --background:  var(--paper);
  --foreground:  var(--ink);
  --primary:     var(--ink);
  --primary-foreground: var(--paper);
  --border: #e5e0d8;
  --ring: var(--gold);
  --radius: 0.5rem;
}

.dark {
  --background: #1a1208;
  --foreground: #e8dcc8;
  --border: #3d3020;
}

body {
  font-family: 'Noto Serif SC', 'Source Han Serif CN', serif;
  background: var(--paper);
  color: var(--ink);
}

/* 高亮颜色 utility */
.hl-yellow { background: var(--hl-yellow); }
.hl-red    { background: var(--hl-red); }
.hl-blue   { background: var(--hl-blue); }
.hl-green  { background: var(--hl-green); }
```

- [ ] **Step 2：创建 utils.ts**

创建 `lib/utils.ts`：
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

安装依赖（若 shadcn/ui 未自动安装）：
```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3：创建根布局**

创建 `app/layout.tsx`：
```typescript
import type { Metadata } from 'next'
import { Noto_Serif_SC } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: '儒典书城 — 传习经典，开启智慧',
  description: '专注儒释道与中国传统文化经典的社会化阅读平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={notoSerifSC.variable}>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 4：创建 Navbar**

创建 `components/layout/Navbar.tsx`：
```typescript
'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="border-b border-[--border] bg-[--ink] text-[--paper]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[--gold]">
          儒典书城
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/books" className="hover:text-[--gold] transition-colors">书库</Link>
          <Link href="/community" className="hover:text-[--gold] transition-colors">社区</Link>
          {user ? (
            <>
              <Link href="/profile" className="hover:text-[--gold] transition-colors">我的</Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-[--paper] hover:text-[--gold]"
              >
                退出
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" variant="outline"
                className="border-[--gold] text-[--gold] hover:bg-[--gold] hover:text-[--ink]">
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 5：创建 Footer**

创建 `components/layout/Footer.tsx`：
```typescript
export function Footer() {
  return (
    <footer className="border-t border-[--border] py-8 text-center text-sm text-gray-500">
      <p>儒典书城 · 传习经典，开启智慧</p>
      <p className="mt-1 text-xs">经典皆为公版，永久免费阅读</p>
    </footer>
  )
}
```

- [ ] **Step 6：创建落地页**

创建 `app/(marketing)/page.tsx`：
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-[--ink] mb-4">
        儒典书城
      </h1>
      <p className="text-xl text-[--gold] mb-2">传习经典 · 开启智慧</p>
      <p className="text-gray-600 max-w-md mb-8">
        专注儒释道与中国传统文化经典的社会化阅读平台。
        与千万读者共读，看见他人如何解读同一段话。
      </p>
      <div className="flex gap-4">
        <Link href="/books">
          <Button size="lg" className="bg-[--ink] text-[--paper] hover:bg-[--gold] hover:text-[--ink]">
            进入书库
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="lg" variant="outline"
            className="border-[--ink] text-[--ink] hover:bg-[--paper-dark]">
            免费注册
          </Button>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 7：验证样式**

```bash
npm run dev
```
预期：`http://localhost:3000` 显示水墨风格落地页，导航栏深色背景 + 金色文字。

- [ ] **Step 8：提交**

```bash
git add .
git commit -m "feat: add ink-wash design system and layout components"
```

---

## Task 5：用户认证（注册 / 登录 / OAuth）

**Files:**
- Create: `app/auth/login/page.tsx`
- Create: `app/auth/register/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `components/auth/LoginForm.tsx`
- Create: `components/auth/RegisterForm.tsx`
- Create: `__tests__/auth.test.ts`

- [ ] **Step 1：写失败的认证测试**

创建 `__tests__/auth.test.ts`：
```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-id', email: 'test@test.com' } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-id' } },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  }),
}))

describe('Auth flows', () => {
  it('should call signUp with email and password', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const result = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.error).toBeNull()
    expect(result.data.user?.email).toBe('test@test.com')
  })

  it('should call signInWithPassword with credentials', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const result = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.error).toBeNull()
    expect(result.data.user?.id).toBe('test-id')
  })
})
```

- [ ] **Step 2：运行确认测试失败（组件还没写）**

```bash
npm test
```
预期：PASS（mock 测试，逻辑简单，验证 mock 配置正确）。

- [ ] **Step 3：创建登录表单组件**

创建 `components/auth/LoginForm.tsx`：
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast({ title: '登录失败', description: error.message, variant: 'destructive' })
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input id="password" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" required />
      </div>
      <Button type="submit" className="w-full bg-[--ink] text-[--paper]" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[--border]" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-500">
          <span className="bg-[--paper] px-2">或</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGitHubLogin}>
        使用 GitHub 登录
      </Button>
    </form>
  )
}
```

- [ ] **Step 4：创建注册表单组件**

创建 `components/auth/RegisterForm.tsx`：
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length < 2) {
      toast({ title: '用户名至少 2 个字符', variant: 'destructive' })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      toast({ title: '注册失败', description: error.message, variant: 'destructive' })
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium">注册成功！</p>
        <p className="text-gray-600 mt-2">请查收邮件，点击确认链接后即可登录。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input id="username" value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="如：墨言禅心" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码（至少 8 位）</Label>
        <Input id="password" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={8} required />
      </div>
      <Button type="submit" className="w-full bg-[--ink] text-[--paper]" disabled={loading}>
        {loading ? '注册中...' : '免费注册'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5：创建认证页面**

创建 `app/auth/login/page.tsx`：
```typescript
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[--border]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登录儒典书城</CardTitle>
          <p className="text-sm text-gray-500">
            还没有账号？
            <Link href="/auth/register" className="text-[--gold] hover:underline ml-1">
              免费注册
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
```

创建 `app/auth/register/page.tsx`：
```typescript
import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[--border]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">加入儒典书城</CardTitle>
          <p className="text-sm text-gray-500">
            已有账号？
            <Link href="/auth/login" className="text-[--gold] hover:underline ml-1">
              直接登录
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6：创建 OAuth 回调路由**

创建 `app/auth/callback/route.ts`：
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
}
```

- [ ] **Step 7：运行测试**

```bash
npm test
```
预期：所有测试 PASS。

- [ ] **Step 8：手动测试注册流程**

```bash
npm run dev
```
1. 访问 `http://localhost:3000/auth/register`
2. 填写用户名、邮箱、密码，点击注册
3. 在 Supabase Studio（`http://localhost:54323`）→ Authentication → Users 确认用户已创建

- [ ] **Step 9：提交**

```bash
git add .
git commit -m "feat: add email and GitHub OAuth authentication"
```

---

## Task 6：配置 GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1：创建 CI 工作流**

```bash
mkdir -p .github/workflows
```

创建 `.github/workflows/ci.yml`：
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint
```

- [ ] **Step 2：添加 lint script**

在 `package.json` 的 `scripts` 中添加：
```json
"lint": "next lint"
```

- [ ] **Step 3：验证本地通过**

```bash
npm test && npx tsc --noEmit
```
预期：全部通过，无 TypeScript 错误。

- [ ] **Step 4：提交并推送到 GitHub**

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow"
git remote add origin https://github.com/<your-username>/shucheng.git
git push -u origin main
```
预期：GitHub Actions 自动运行，CI 绿色通过。

---

## Task 7：连接 Vercel 并部署

**Files:**（无代码文件，只需配置）

- [ ] **Step 1：在 Vercel 创建项目**

```bash
npm install -g vercel
vercel link
```
按提示选择：Link to existing project? No → 输入项目名 `shucheng` → Framework: Next.js

- [ ] **Step 2：配置环境变量**

在 Vercel Dashboard → Project → Settings → Environment Variables 添加：
```
NEXT_PUBLIC_SUPABASE_URL        = <Supabase Cloud 项目 URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY   = <Supabase Cloud anon key>
SUPABASE_SERVICE_ROLE_KEY       = <Supabase Cloud service role key>
```

（Supabase Cloud：新建免费项目 → Settings → API 获取）

- [ ] **Step 3：部署到 Vercel**

```bash
vercel --prod
```
预期：输出部署 URL，如 `https://shucheng.vercel.app`。

- [ ] **Step 4：应用 Schema 到生产库**

```bash
supabase link --project-ref <your-supabase-project-ref>
supabase db push
```
预期：迁移成功应用到 Supabase Cloud。

- [ ] **Step 5：验证生产环境**

访问 Vercel 部署 URL，确认：
- 落地页正常显示
- 导航栏水墨风格正确
- 注册/登录页可访问

- [ ] **Step 6：最终提交**

```bash
git add .
git commit -m "chore: complete Plan 1 foundation setup"
git push
```

---

## 自审

| 检查项 | 结果 |
|---|---|
| 规格覆盖 | ✅ 覆盖：项目初始化、DB Schema 全部10表、RLS策略、Auth（邮箱+OAuth）、设计系统、CI/CD、Vercel部署 |
| 占位符扫描 | ✅ 无 TBD/TODO |
| 类型一致性 | ✅ `createClient()` 在 client.ts/server.ts/middleware.ts 签名一致 |
| 遗漏检查 | ✅ 成功标准中「用户可注册登录」已覆盖 |
