# Personal Blog Project

## Current Status (2026-05-08)
- 四大模块（博客/日记/待办/日程）+ PWA 均已完成并构建通过
- 尚未部署到 Vercel（需先 git push 到 GitHub）
- 下一步优先：部署上线，让移动端能访问
- Node 版本兼容问题已解决（使用 nvm-windows 切换到 v18.19.0）
- 项目待办清单见 `TODO.md`

## Overview
- Next.js 14 App Router + TypeScript personal blog with PWA support
- Content: File-based markdown (blog/diary) + localStorage with seed JSON (todo/schedule)
- Deployed on Vercel via git push
- Node.js: Requires >=18.17 (currently v18.19.0 via nvm-windows)

## Key Architecture
- **Blog/Diary**: Markdown in `content/` parsed at build time via `generateStaticParams()`. No server writes.
- **Todo/Schedule**: Browser localStorage for runtime, `content/data/*.json` as seed. Manual export/import for cross-device sync. `StorageBackend` interface in `src/lib/storage.ts` for future Vercel KV migration.
- **PWA**: Serwist (`@serwist/next` v9) — SW at `src/app/sw.ts`, manifest at `src/app/manifest.ts`

## Commands
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build (generates static pages + service worker)
- `npm run start` — Serve production build
- `npm run lint` — Run ESLint

## Project Conventions
- Source code in `src/`, content in `content/`, dev notes in `dev-notes/`
- Client components marked with `"use client"`, server components by default
- Path alias `@/` maps to `src/`
- UUID v4 for todo/schedule item IDs
- Tailwind CSS v3 with `@tailwindcss/typography` for prose

## File Map
- `src/lib/content.ts` — FS helpers: read posts, get slugs, parse frontmatter
- `src/lib/markdown.ts` — remark pipeline: gray-matter → remark-gfm → rehype-highlight → HTML
- `src/lib/storage.ts` — StorageBackend interface + localStorage implementation
- `src/lib/utils.ts` — formatDate, slugify utilities
- `src/hooks/useLocalStorage.ts` — Generic typed localStorage hook
- `src/hooks/useTodos.ts` — Todo CRUD + seed loading + export/import
- `src/hooks/useSchedule.ts` — Schedule CRUD + seed loading + export/import
- `src/app/api/seed-data/route.ts` — Serves `content/data/*.json` as API
- `src/app/manifest.ts` — PWA manifest generation
- `src/app/sw.ts` — Service worker (Serwist)

## Content Structure
- `content/blog/*.md` — filename = slug, frontmatter: title, date, tags, excerpt
- `content/diary/YYYY/MM-DD.md` — frontmatter: date, mood, tags
- `content/data/todos.json` — Todo seed data
- `content/data/schedule.json` — Schedule seed data

## Key Decisions (see dev-notes/)
- `dev-notes/2026-05-08-architecture.md` — Overall architecture decisions
- `dev-notes/2026-05-08-pwa-setup.md` — Serwist PWA configuration
- `dev-notes/2026-05-08-vercel-deploy.md` — Vercel deployment guide
