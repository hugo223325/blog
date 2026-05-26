# 数字花园博客

## Current Status (2026-05-21)

- **全动态架构** — D1 数据库 + `_worker.js` API + 客户端前端
- 部署于 Cloudflare Pages（`blog-7mr.pages.dev`）
- 所有内容实时同步，无需 git push
- 暗色/亮色手动切换（`darkMode: "class"`）
- 博客搜索、阅读时间、浮动目录、侧边栏 Profile
- Node 22+ 用于 wrangler 命令，Node 18+ 可构建前端

## Architecture

```
浏览器 ←→ Cloudflare Pages
              │
              ├── out/ (Next.js 静态导出)
              └── _worker.js (API + D1 数据库)
```

- **所有数据**：D1 数据库（6 表），`_worker.js` 提供 `/api/*` 路由
- **API 端口**：同域名的 `_worker.js`（非独立 Workers），解决国内 workers.dev 被墙
- **认证**：密码存 D1 settings 表，前端 sessionStorage 缓存，`ensureAuth()` 全局验证
- **写操作**：密码验证后乐观更新 UI，API 失败时回退 + Toast 提示
- **PWA**：Serwist v9

## Database

| 表 | 用途 |
|---|---|
| settings | key-value 配置（密码、身高等） |
| posts | 博客文章（slug, title, content, tags, created_at） |
| diary | 日记（date, content, mood, tags） |
| todos | 待办（id, text, done, priority, due_date） |
| schedule | 日程（id, title, date, time, duration） |
| weight | 体重（id, date, weight, note） |

## Commands

```bash
npm run dev                                    # 前端开发 (port 3000)
npm run build                                  # 前端构建 (out/)
# 构建 + 直接部署到 Cloudflare
npm run build && cp _worker.js out/ && \
  npx wrangler pages deploy out/ --project-name=blog --branch=main

# Worker 管理（需 Node 22+）
cd worker
npx wrangler d1 execute blog-db --file=schema.sql --remote
```

## File Map

```
_worker.js                    # API 核心（零依赖，手动路由）
src/
├── lib/api.ts                # 前端 API 客户端（fetch 封装 + auth）
├── lib/markdown.ts           # Markdown → HTML（remark 流水线）
├── lib/utils.ts              # formatDate 等工具
├── hooks/
│   ├── useAuth.tsx           # 全局认证 Provider + ensureAuth
│   ├── useTodos.ts           # 待办 CRUD（API 驱动）
│   ├── useSchedule.ts        # 日程 CRUD（API 驱动）
│   ├── useWeight.ts          # 体重 CRUD（API 驱动）
│   ├── useToast.tsx          # Toast 通知
│   └── useKeyboard.ts        # 键盘快捷键
├── components/
│   ├── ui/
│   │   ├── Editor.tsx        # Markdown 编辑器（Ctrl+S 保存/预览）
│   │   ├── PasswordGate.tsx   # 密码验证弹窗
│   │   ├── ThemeToggle.tsx    # 暗色/亮色切换
│   │   ├── Providers.tsx      # Context 包装器
│   │   └── Toaster.tsx        # Toast 渲染
│   ├── blog/                 # BlogCard, BlogContent, PostDetail
│   ├── diary/                # DiaryEntry, DiaryCalendar
│   ├── todo/                 # TodoItem, AddTodoForm, TodoExportImport
│   ├── schedule/             # ScheduleItem, AddScheduleForm
│   ├── weight/               # WeightChart, AddWeightForm
│   └── layout/               # Header, Navigation, Footer
├── app/
│   ├── page.tsx              # 首页（卡片网格 + 最近文章/日记）
│   ├── blog/page.tsx         # 博客（列表 + 搜索 + 详情 + 编辑 + 侧边栏）
│   ├── diary/page.tsx        # 日记（列表 + 详情 + 编辑）
│   ├── todo/page.tsx         # 待办
│   ├── schedule/page.tsx     # 日程
│   ├── weight/page.tsx       # 体重
│   ├── setup/page.tsx        # 改密码
│   ├── not-found.tsx         # 404
│   ├── sw.ts                 # Service Worker
│   └── manifest.ts           # PWA manifest
└── types/                    # TypeScript 类型（blog/diary/todo/schedule/weight）

worker/                       # 备用 Workers 项目
  ├── src/index.ts            # Hono API（已被 _worker.js 替代）
  └── schema.sql              # D1 建表语句
```

## 已知问题 & 解决方案

| 问题 | 原因 | 解决 |
|---|---|---|
| 博客编辑后内容不更新 | D1 主从延迟，SELECT 回读拿到旧数据 | Editor 用本地 state 构造 savedPost，不依赖 DB 回读 |
| GitHub push 被墙 | HTTPS 443 阻断 | 用 `wrangler pages deploy out/` 直接上传 |
| workers.dev API 被墙 | 国内 DNS 污染 | 改用 `_worker.js` 同域名部署 |
| 中文标题 slug 为空 | `[^\w-]` 过滤掉中文 | `makeSlug()` 保留中文 + 时间戳后缀 |

## Deployment

- **主渠道**: `wrangler pages deploy out/ --project-name=blog --branch=main`
- **备用**: `git push origin master:main` → Cloudflare Pages 自动构建
- API 和前端在同一域名下，无需额外 CORS 配置
