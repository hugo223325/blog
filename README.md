# 我的个人博客

基于 Next.js 14 的个人博客，包含博客、日记、待办、日程功能。支持 PWA 离线访问。

## 功能

- **博客** — Markdown 撰写，静态生成，SEO 友好
- **日记** — 按日期组织，记录每日生活
- **待办** — 优先级管理、截止日期、导出/导入
- **日程** — 按日期分组，时间规划

## 技术栈

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS v3
- Markdown 文件存储 + gray-matter 解析
- Serwist PWA（离线支持）
- Vercel 部署

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 内容管理

所有内容存储在 `content/` 目录：

```
content/
├── blog/*.md          # 博客文章
├── diary/YYYY/MM-DD.md # 日记
└── data/*.json        # 待办/日程种子数据
```

待办和日程数据在浏览器端编辑，可使用导出/导入功能备份。

## 构建

```bash
npm run build
npm run start
```

## 部署

推送到 GitHub → Vercel 自动部署。详见 `dev-notes/2026-05-08-vercel-deploy.md`
