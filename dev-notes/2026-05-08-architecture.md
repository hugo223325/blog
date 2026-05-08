# 架构决策记录

日期：2026-05-08
状态：已决定

## 背景

从零搭建个人博客，需要支持博客文章、日记、待办、日程四大功能模块，可通过任意设备联网访问。

## 决策

### 技术栈
- **Next.js 14 + React 18** — App Router 提供静态生成 + 动态功能的完美结合
- **TypeScript** — 类型安全
- **Tailwind CSS v3** — 快速样式开发
- **纯文件存储** — Markdown 用于博客/日记，JSON 用于种子数据
- **Vercel 部署** — 免费、自动部署、全球 CDN

### 数据存储策略
- 博客/日记：Markdown 文件存储于 `content/`，Git 版本管理，构建时静态生成
- 待办/日程：浏览器 localStorage 运行时存储，`content/data/*.json` 作为种子数据
- 跨设备同步：手动导出/导入 JSON 文件

### Node.js 版本
- 从 v16.20.0 切换到 v18.19.0（通过 nvm-windows）
- Next.js 14 要求 Node >= 18.17

## 备选方案

- **数据库（SQLite/PostgreSQL）**：增加运维复杂度，超出 MVP 需求
- **Vercel KV**：实时同步能力，但增加成本。已预留 StorageBackend 接口，未来可切换
- **Next.js 16 + React 19**：Node 版本不兼容，降级到 v14

## 影响

- ✅ 零成本运行（Vercel 免费计划）
- ✅ 内容 Git 备份，永不丢失
- ⚠️ 待办/日程不支持自动跨设备同步
- ⚠️ Node 版本较旧，未来升级可能遇到类似问题
