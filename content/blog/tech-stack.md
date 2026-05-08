---
title: "搭建个人博客的技术选型"
date: "2026-05-08"
tags: ["技术", "Next.js", "博客搭建"]
excerpt: "记录搭建这个博客时的技术选型思路和架构决策。"
---

# 搭建个人博客的技术选型

## 技术栈

- **框架**：Next.js 14 + React 18
- **语言**：TypeScript
- **样式**：Tailwind CSS v3
- **内容**：Markdown 文件存储 + gray-matter 解析
- **部署**：Vercel

## 为什么选 Next.js

1. 静态生成 + 动态功能的完美结合
2. App Router 提供灵活的路由方案
3. 内置 SEO 优化（generateMetadata）
4. Vercel 一键部署，免费且高效

## 内容管理

所有博客文章和日记都用 Markdown 格式存储在 `content/` 目录中，Git 版本管理，无需数据库。

待办和日程数据通过 localStorage 在浏览器端存储，提供导出/导入功能实现跨设备同步。
