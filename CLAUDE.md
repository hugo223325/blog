# 数字花园博客

## Current Status (2026-05-18)

- **全动态架构已完成** — D1 数据库 + Workers API + 客户端前端
- 部署于 Cloudflare Pages + Workers
- 所有内容实时同步，无需 git push
- Node 22+ 用于 Workers 开发，Node 18/22 均可构建前端

## Architecture

```
浏览器 ←→ Cloudflare Pages（Next.js 静态前端）
                ↓ fetch API
         Workers（Hono，API 层）
                ↓
           ┌───┴───┐
          D1        R2（待创建）
```

- **所有数据**: D1 数据库，Workers API 读写
- **前端**: Next.js 14 静态导出，客户端组件 fetch API
- **认证**: 密码存 D1 settings 表，sessionStorage 缓存
- **PWA**: Serwist v9

## API

| URL | 用途 |
|---|---|
| `https://blog-api.1752190332.workers.dev` | Workers API |
| Worker 代码 | `worker/src/index.ts` |
| DB schema | `worker/schema.sql` |

## Commands

```bash
npm run dev                # 前端开发 (port 3000)
npm run build              # 前端构建
cd worker && npm run deploy  # Workers 部署
```

## File Map

```
src/
├── lib/api.ts             # API 客户端（fetch 封装）
├── lib/markdown.ts        # Markdown → HTML 渲染
├── lib/utils.ts           # 工具函数
├── hooks/
│   ├── useTodos.ts        # 待办（API 驱动）
│   ├── useSchedule.ts     # 日程（API 驱动）
│   ├── useWeight.ts       # 体重（API 驱动）
│   ├── useToast.tsx       # Toast 通知
│   └── useKeyboard.ts     # 键盘快捷键
├── components/
│   ├── ui/
│   │   ├── Editor.tsx     # Markdown 编辑器
│   │   ├── PasswordGate.tsx # 密码验证
│   │   ├── Providers.tsx  # Context 包装器
│   │   └── Toaster.tsx    # Toast 渲染
│   ├── blog/              # BlogCard, BlogContent
│   ├── diary/             # DiaryEntry, DiaryCalendar
│   ├── todo/              # TodoItem, AddTodoForm, TodoExportImport
│   ├── schedule/          # ScheduleItem, AddScheduleForm
│   ├── weight/            # WeightChart, AddWeightForm
│   └── layout/            # Header, Navigation, Footer
├── app/
│   ├── page.tsx           # 首页（API 驱动）
│   ├── blog/page.tsx      # 博客（列表 + 详情 + 编辑）
│   ├── diary/page.tsx     # 日记（列表 + 详情 + 编辑）
│   ├── todo/page.tsx      # 待办
│   ├── schedule/page.tsx  # 日程
│   ├── weight/page.tsx    # 体重
│   ├── setup/page.tsx     # 改密码
│   ├── not-found.tsx      # 404
│   ├── sw.ts              # Service Worker
│   └── manifest.ts        # PWA manifest
└── types/                 # TypeScript 类型
```

## Deployment

- **前端**: `git push` → Cloudflare Pages 自动构建
- **API**: `cd worker && npx wrangler deploy`
- **DB schema**: `cd worker && npx wrangler d1 execute blog-db --file=schema.sql --remote`
