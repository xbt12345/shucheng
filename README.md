# 儒典书城

> 一个面向中国传统文化与世界经典的在线阅读平台，参照微信读书体验设计，免费部署。

**线上地址**：[shucheng-seven.vercel.app](https://shucheng-seven.vercel.app)

---

## 功能特性

- **书库**：涵盖儒、释、道、史、集、哲、文七大分类，收录 80+ 部经典著作
- **在线阅读**：内置 EPUB 阅读器（epub.js），支持字体调节、护眼/夜间/纸白三种主题
- **划线标注**：选中文字即可标注（四色），实时同步至云端，支持 Realtime 推送
- **书评评分**：五星评分 + 书评，含内容过滤
- **书单**：创建/编辑/公开书单，支持拖拽排序
- **话题圈**：创建话题圈，加入/退出，社区讨论
- **发现页**：热读榜、热门标注、精选书单、最新入库
- **个人主页**：阅读记录、标注、书评三 Tab，打卡连续天数
- **管理后台**：书籍上传、内容审核（Admin 角色）

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Next.js 16 App Router + TypeScript |
| 样式 | TailwindCSS v4 + shadcn/ui（base-nova 主题） |
| 数据库 | Supabase PostgreSQL + RLS 行级安全 |
| 认证 | Supabase Auth（邮箱/密码，预留 GitHub OAuth） |
| 存储 | Supabase Storage（books / covers bucket） |
| 实时 | Supabase Realtime（标注实时同步） |
| 阅读器 | epub.js v0.3（动态 import，避免 SSR） |
| 状态 | Zustand v5（阅读器客户端状态） |
| 通知 | sonner（Toast） |
| 部署 | Vercel（自动 CI/CD） |

---

## 本地运行

### 1. 克隆仓库

```bash
git clone https://github.com/xbt12345/shucheng.git
cd shucheng
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入 Supabase 项目信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Supabase 项目可在 [supabase.com](https://supabase.com) 免费创建。

### 3. 初始化数据库

将 `supabase/migrations/` 目录下的 SQL 文件按文件名顺序在 Supabase SQL Editor 中依次执行。

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可预览。

---

## 项目结构

```
app/
├── (marketing)/        # 首页
├── books/              # 书库 + 书籍详情 + 阅读器
├── discover/           # 发现页
├── circles/            # 话题圈
├── booklists/          # 书单
├── profile/            # 个人主页
├── admin/              # 管理后台
└── api/                # API 路由

components/
├── books/              # 书籍相关组件
├── reader/             # EPUB/PDF 阅读器
├── community/          # 评论、关注、打卡
└── layout/             # Navbar / Footer

supabase/
└── migrations/         # 数据库迁移文件（按时间戳排序）
```

---

## 书目来源

- **中国古籍**：四书五经、诸子百家、史书、唐诗宋词等公版古籍
- **佛教典籍**：金刚经、心经、六祖坛经、楞伽经等
- **世界经典**：古希腊哲学（柏拉图/亚里士多德）、古罗马（西塞罗/马可·奥勒留）、欧洲文学（但丁/莎士比亚/卡夫卡）、印度（薄伽梵歌/奥义书）等
- EPUB 文件来源：[Project Gutenberg](https://www.gutenberg.org)（公版，合法免费）
- 封面图片：[Open Library Covers API](https://covers.openlibrary.org)

---

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xbt12345/shucheng)

1. 点击上方按钮，导入仓库到 Vercel
2. 在 Vercel 项目设置中添加三个环境变量（同 `.env.local`）
3. 部署完成后，在 Supabase Dashboard 将 Vercel 域名加入 Authentication → URL Configuration

---

## 开源协议

MIT License — 自由使用、修改、分发。
