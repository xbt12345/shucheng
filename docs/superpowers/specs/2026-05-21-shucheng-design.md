# 儒典书城 — 系统设计文档

> 创建时间：2026-05-21  
> 版本：v1.0  
> 状态：已确认，待实现

---

## 一、项目概述

### 目标
搭建一个以儒释道与中国传统文化经典为核心的公开阅读平台，参考微信读书，支持高亮标注、批注评论、社区互动等功能。

### 核心价值主张
- **内容聚焦**：专注儒释道及中国传统经典，公版古籍内嵌 + 管理员可上传
- **社会阅读**：高亮标注实时可见，看到他人如何读同一本书
- **深度社区**：书评、书单、话题圈、打卡、排行榜

### 约束条件
- 第一版：纯 Web（PC + 移动浏览器响应式），后续扩展 App
- 部署：免费托管（Vercel + Supabase 免费层），零运维
- 用户规模：初期 0~5 万月活，免费额度覆盖

---

## 二、系统架构

### 技术选型

| 层 | 技术 | 版本 | 理由 |
|---|---|---|---|
| 前端框架 | Next.js | 15 (App Router) | 全球 #1 React 框架，SSR + API Routes 合一 |
| UI 组件 | shadcn/ui + TailwindCSS | latest | 高度可定制，无样式束缚 |
| 阅读器 | epub.js | v0.3 | 专为 epub 设计，支持 CFI 精确定位 |
| 客户端状态 | Zustand | v4 | 轻量，适合阅读器复杂状态 |
| 后端/DB | Supabase (PostgreSQL) | latest | 自带 Auth + Realtime + Storage |
| 实时通信 | Supabase Realtime | — | 标注实时广播，无需额外 WebSocket 服务 |
| 文件存储 | Supabase Storage | — | epub + 封面 + 头像 |
| 部署-前端 | Vercel | — | 免费 100GB/月，自动 CI/CD |
| 部署-后端 | Supabase Cloud | — | 免费 5 万月活 |

### 架构图

```
用户浏览器（Next.js 15 App）
       ↓ HTTPS
Vercel Edge CDN（SSR + API Routes）
       ↓ REST / Realtime WebSocket
Supabase 后端
  ├── PostgreSQL（数据）
  ├── Auth（用户认证，JWT）
  ├── Realtime（标注实时同步）
  └── Storage（epub 文件 + 媒体资源）
```

---

## 三、功能模块

### M1 书库模块（BookStore）
- 书籍列表，按儒 / 释 / 道 / 史 / 集分类浏览
- 书籍详情页：简介、目录、评分、书评数（SSR，SEO 友好）
- 全文搜索：书名 / 作者 / 正文片段（PostgreSQL 全文搜索）
- 管理员后台：上传 epub/txt + 封面管理
- 热榜 / 新书 / 编辑推荐

### M2 阅读器模块（Reader）
- epub.js 渲染引擎（分页 / 连续滚动两种模式）
- 阅读偏好：字体大小、字体族、背景色（纸白 / 护眼 / 夜间）
- 划词高亮：4 色可选（黄 / 红 / 蓝 / 绿），基于 CFI Range
- 段落批注：私密 / 仅好友可见 / 公开，附文字注释
- 书签管理 + 阅读进度自动记录
- 他人公开高亮实时叠加显示（Supabase Realtime）

### M3 社区模块（Community）
- 书评：长文评论 + 1~5 星评分
- 书单：主题书单，可设公开 / 私密
- 话题圈：如「论语读书会」「禅修日记」，可关联书籍
- 评论区：点赞 / 嵌套回复 / @他人
- 热门标注广场：被点赞最多的公开批注

### M4 用户与社交模块（User & Social）
- 注册 / 登录：邮箱密码 + OAuth（GitHub，后续接微信）
- 个人主页：书架 / 书评 / 书单 / 粉丝数
- 关注 / 被关注 + 消息通知中心
- 读书打卡：连续天数统计 + 里程碑徽章（7 / 30 / 100 天）
- 阅读时长统计 / 年度阅读报告

### M5 排行与发现模块（Discovery）
- 书籍热度榜 / 评分榜 / 新书榜
- 用户阅读量排行榜
- 关注的人在读什么（动态流）
- 智能推荐：读过这本的人还读了什么

### M6 管理后台（Admin）
- 书籍上传 / 编辑 / 下架
- 用户管理 / 封禁
- 评论审核：关键词过滤 + 人工审核队列
- 数据看板：DAU / 阅读时长 / 热门书籍

---

## 四、数据库 Schema

### 核心表（PostgreSQL，Supabase）

```sql
-- 用户信息（扩展 Supabase Auth）
profiles (
  id          uuid PK → auth.users.id,
  username    text UNIQUE,
  avatar_url  text,
  bio         text,
  created_at  timestamptz
)

-- 书籍
books (
  id           uuid PK,
  title        text,
  author       text,
  category     text,  -- 儒/释/道/史/集
  description  text,
  cover_url    text,
  file_url     text,  -- epub 文件
  published_at date,
  is_public    bool,  -- 公版 or 管理员上传
  created_at   timestamptz
)

-- 章节（epub 解析后）
chapters (
  id        uuid PK,
  book_id   uuid FK → books.id,
  title     text,
  order_num int,
  cfi_range text  -- epub CFI 定位
)

-- 高亮标注（核心）
highlights (
  id          uuid PK,
  user_id     uuid FK → profiles.id,
  book_id     uuid FK → books.id,
  chapter_id  uuid FK → chapters.id,
  cfi_range   text,        -- 精确到字符的 epub CFI
  text        text,        -- 被高亮的原文
  color       text,        -- yellow/red/blue/green
  note        text,        -- 批注（可为空）
  visibility  text,        -- public/friends/private
  like_count  int DEFAULT 0,
  created_at  timestamptz
)

-- 评论（书评 + 标注评论，parent_id 做嵌套）
comments (
  id           uuid PK,
  user_id      uuid FK → profiles.id,
  book_id      uuid FK → books.id,
  highlight_id uuid FK → highlights.id NULLABLE,
  parent_id    uuid FK → comments.id NULLABLE,
  content      text,
  rating       int,   -- 1-5，仅顶级书评
  like_count   int DEFAULT 0,
  created_at   timestamptz
)

-- 书单
booklists (
  id          uuid PK,
  user_id     uuid FK → profiles.id,
  title       text,
  description text,
  is_public   bool,
  created_at  timestamptz
)

booklist_items (
  booklist_id uuid FK → booklists.id,
  book_id     uuid FK → books.id,
  order_num   int,
  PRIMARY KEY (booklist_id, book_id)
)

-- 关注关系
follows (
  follower_id  uuid FK → profiles.id,
  following_id uuid FK → profiles.id,
  created_at   timestamptz,
  PRIMARY KEY (follower_id, following_id)
)

-- 阅读记录 / 打卡
reading_logs (
  id           uuid PK,
  user_id      uuid FK → profiles.id,
  book_id      uuid FK → books.id,
  progress_cfi text,   -- 当前阅读位置
  duration_sec int,    -- 本次阅读秒数
  logged_at    date    -- 打卡日期（去重用）
)

-- 话题圈
circles (
  id           uuid PK,
  name         text,
  description  text,
  book_id      uuid FK → books.id NULLABLE,
  owner_id     uuid FK → profiles.id,
  member_count int DEFAULT 0,
  created_at   timestamptz
)
```

### Row-Level Security 策略
- `highlights`：`visibility='private'` → 仅创建者可读；`public` → 所有人可读
- `reading_logs`：仅本人可读写
- `books`：所有人可读，仅 `admin` 角色可写
- `profiles`：所有人可读，仅本人可写

### 关键索引
```sql
CREATE INDEX ON highlights(book_id, chapter_id);   -- 实时加载同章节标注
CREATE INDEX ON comments(book_id);                  -- 书评列表
CREATE INDEX ON reading_logs(user_id, logged_at);  -- 打卡连续天数
CREATE INDEX ON follows(following_id);              -- 粉丝数聚合
```

---

## 五、前端页面结构

### App Router 路由树

```
app/
├── (marketing)/
│   └── page.tsx              # 落地页（SEO 首页）
├── books/
│   ├── page.tsx              # 书城列表
│   └── [id]/
│       ├── page.tsx          # 书籍详情
│       └── read/page.tsx     # 阅读器
├── community/
│   ├── page.tsx              # 社区广场
│   ├── circles/
│   │   ├── page.tsx          # 话题圈列表
│   │   └── [id]/page.tsx     # 圈子详情
│   └── highlights/page.tsx   # 热门标注广场
├── profile/
│   ├── page.tsx              # 我的主页
│   ├── bookshelf/page.tsx    # 我的书架
│   ├── booklists/page.tsx    # 我的书单
│   └── checkin/page.tsx      # 打卡记录
├── user/[username]/page.tsx  # 他人主页
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
└── admin/                    # 管理后台（受保护路由）
    ├── books/page.tsx
    ├── users/page.tsx
    └── reviews/page.tsx
```

### UI 设计语言：水墨禅意
- **主色**：墨色 `#3d2c1e`，金色 `#d6b887`，纸色 `#faf8f4`
- **正文字体**：Noto Serif SC（衬线字体，阅读感强）
- **高亮色**：黄 `#fef08a`，红 `#fca5a5`，蓝 `#93c5fd`，绿 `#86efac`
- **组件库**：shadcn/ui（无自带样式，完全定制）

---

## 六、数据流与实时机制

### 流 1：阅读 & 高亮标注（核心流）
1. Next.js SSR 渲染书籍详情（SEO 友好）
2. 客户端 epub.js 加载 Supabase Storage 中的 epub 文件
3. 拉取本章节所有 public highlights
4. 订阅 Supabase Realtime（`highlights` 表，过滤本书+本章节）
5. 用户划词 → epub.js 生成 CFI Range → 弹出颜色选择器
6. 乐观更新（先渲染）→ INSERT highlights → Realtime 广播给其他读者

### 流 2：评论 & 社区互动
1. POST `/api/comments`（Next.js API Route）
2. 服务端关键词过滤审核
3. INSERT comments → DB Trigger 更新 `books.comment_count`
4. 点赞超阈值 → 自动进入热门标注广场
5. Realtime 通知作者

### 流 3：打卡 & 关注动态流
1. 前端每 5 分钟 UPSERT `reading_logs`（user + book + date）
2. SQL Window Function 计算连续打卡天数
3. 里程碑达成（7/30/100 天）→ 解锁徽章
4. 关注动态：PostgreSQL 直查（无需 Redis，初期足够）
5. Next.js ISR（每分钟刷新）保证动态流 SEO 可见

---

## 七、部署方案

### 服务组合

| 服务 | 用途 | 免费额度 | 月费 |
|---|---|---|---|
| Vercel | Next.js 托管 + 全球 CDN | 100GB 流量 | $0 |
| Supabase | DB + Auth + Storage + Realtime | 5万月活 / 1GB存储 | $0 |
| GitHub | 代码仓库 + CI/CD 触发 | 无限 | $0 |
| **合计** | | | **$0** |

### CI/CD 流水线
`git push main` → GitHub → Vercel 自动构建 → 部署 → CDN 更新（全程 ~60 秒）

### 本地开发三步
```bash
npx create-next-app@latest shucheng --typescript --tailwind --app
npx supabase init && supabase start
vercel link
```

### 扩展路径
- 用户超 5 万：升级 Supabase Pro（$25/月）+ Vercel Pro（$20/月）= $45/月
- 存储超 1GB：Supabase Storage 扩容，无需代码改动
- 实时并发超 200：升级后支持无限并发

---

## 八、多 Agent 开发团队分工

| Agent 角色 | 负责模块 |
|---|---|
| 🏗️ 架构师 | 项目初始化、Supabase Schema、RLS 策略 |
| 📚 书库工程师 | M1 书库模块、epub 解析、搜索功能 |
| 📖 阅读器工程师 | M2 阅读器、epub.js 集成、高亮标注、Realtime |
| 🌐 社区工程师 | M3 社区、M4 社交、评论/书单/话题圈 |
| 🎨 UI 工程师 | 水墨禅意设计系统、shadcn/ui 定制、响应式 |
| 🛡️ 管理员工程师 | M6 管理后台、内容审核、数据看板 |

---

## 九、成功标准

- [ ] 用户可注册登录，完善个人信息
- [ ] 书库展示至少 20 本公版经典，分类可浏览
- [ ] 阅读器可渲染 epub，支持高亮、批注
- [ ] 他人公开高亮在同章节实时可见（< 1 秒延迟）
- [ ] 书评、评论、点赞、关注功能可用
- [ ] 打卡连续天数正确计算，徽章可解锁
- [ ] 管理员可上传书籍、审核评论
- [ ] Lighthouse 性能评分 > 90
- [ ] 部署至 Vercel，域名可访问
