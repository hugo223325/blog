# 数字花园博客

基于 Next.js 14 的全动态个人博客——博客、日记、待办、日程、体重管理。所有数据云端存储，任何设备实时同步。

## 功能

- **博客** — Web 编辑器写 Markdown，实时发布，搜索 + 标签筛选
- **日记** — 按日期组织，随时记录
- **待办** — 优先级管理、截止日期、导出/导入
- **日程** — 按日期分组，时间规划
- **体重** — SVG 折线图、BMI、目标体重
- **暗色/亮色** — 手动切换
- **PWA** — 离线可用，可添加到主屏幕

## 技术栈

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS v3（class-based dark mode）
- Cloudflare D1 数据库 + `_worker.js` API
- Serwist PWA（离线支持）
- Cloudflare Pages 部署

## 架构

```
浏览器 ←→ blog-7mr.pages.dev
              │
              ├── out/（Next.js 静态导出）
              └── _worker.js（API → D1）
```

所有数据通过 API 实时读写，无需 git push。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
```

## 构建 & 部署

```bash
# 构建
npm run build

# 部署到 Cloudflare Pages
npm run build && cp _worker.js out/ && \
  npx wrangler pages deploy out/ --project-name=blog --branch=main
```
