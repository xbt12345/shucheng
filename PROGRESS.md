# 书城项目 - 设计进度记录

> 更新时间：2026-05-21
> 目的：防止 token 耗尽后不知道进行到哪一步

## 当前阶段
**阶段 2/8 — 可视化伴侣已启用，待启动服务器**

## 任务清单
- [x] 1. 探索项目上下文（无现有项目，全新搭建）
- [x] 2. 提供可视化伴侣选项（用户已同意）
- [ ] 3. 逐一澄清需求问题（进行中）
- [ ] 4. 提出 2-3 个架构方案
- [ ] 5. 呈现完整设计方案
- [ ] 6. 编写设计文档并提交
- [ ] 7. 规格自审 + 用户审核
- [ ] 8. 移交实现规划阶段

## 已知需求（原始描述）
- 书城主题：儒释道 + 中国传统文化经典书籍
- 参考产品：微信读书
- 核心功能：标注高亮、个人评价、社区评论（他人可见）
- 技术要求：市面最受认可、使用最多的架构
- 开发方式：多 Agent 扮演不同团队角色协作完成

## 设计确认进度
- [x] 第1节：系统架构总览
- [x] 第2节：功能模块设计（M1-M6）
- [x] 第3节：数据库 Schema（10张表确认）
- [x] 第4节：前端页面结构（水墨禅意UI，App Router路由树）
- [x] 第5节：数据流与实时机制（3条核心流+权限矩阵）
- [x] 第6节：部署方案（Vercel+Supabase 免费层，$0/月）
- [x] 设计文档已写入：docs/superpowers/specs/2026-05-21-shucheng-design.md
- [x] 规格自审通过（无占位符、无矛盾、无歧义）
- [x] 四份实现计划已生成：
  - Plan 1: docs/superpowers/plans/2026-05-21-plan1-foundation.md（基础层+Auth）
  - Plan 2: docs/superpowers/plans/2026-05-21-plan2-reader.md（书库+阅读器+Realtime）
  - Plan 3: docs/superpowers/plans/2026-05-21-plan3-community.md（社区+社交）
  - Plan 4: docs/superpowers/plans/2026-05-21-plan4-discovery-admin.md（发现+管理后台）

## 澄清问题记录
Q1. 用户规模？→ **C. 公开平台**（面向公众，需完整用户系统、高并发、内容审核）
Q2. 前端平台？→ **C. 先 Web，后续扩展 App**（分阶段，第一版纯 Web）
Q3. 书籍来源？→ **C. 公版古籍内嵌 + 管理员上传**
Q4. 社区深度？→ **C. 深度社区**（关注/书评/书单/话题圈/打卡/排行榜）
Q5. 技术栈偏好？→ **A. 完全听推荐**（业界最主流组合）
Q6. 部署偏好？→ **免费+方便** → Vercel + Railway + Supabase 托管方案

## 架构决策
**选定方案：A — Next.js 15 + Supabase + Vercel**
- 前端：Next.js 15 (App Router) + TailwindCSS + shadcn/ui
- 后端：Next.js API Routes + Supabase Edge Functions
- 数据库：Supabase PostgreSQL + Row-Level Security
- 实时：Supabase Realtime（标注/评论同步）
- 存储：Supabase Storage（书籍文件、封面、头像）
- 部署：Vercel（前端）+ Supabase（后端，免费10万月活）

## 可视化服务器
- URL: http://localhost:53951
- screen_dir: C:\Users\xiabutian\Desktop\shucheng-project\.superpowers\brainstorm\1485-1779346335\content
- state_dir: C:\Users\xiabutian\Desktop\shucheng-project\.superpowers\brainstorm\1485-1779346335\state

## 项目路径
C:/Users/xiabutian/Desktop/shucheng-project/
