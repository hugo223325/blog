# 全动态网站迁移：文件系统 + localStorage → D1 + Workers

**日期**: 2026-05-18
**状态**: ✅ 完成
**构建**: 12/12 页面，零错误

---

## 一、动机

之前是纯静态网站——博客/日记存 Markdown 文件，待办/日程/体重存浏览器 localStorage。三个致命问题：

1. **写操作需要 git push** — 手机无法写博客/日记
2. **数据互不相通** — 设备 A 的待办，设备 B 看不到
3. **没有后端** — 不是"正常网站"的感觉

目标：打开浏览器就能写、能改、能传图，所有设备实时同步。

---

## 二、最终架构

```
┌──────────────────────────────────────────────┐
│  Cloudflare Pages (blog-7mr.pages.dev)       │
│                                              │
│  ┌──────────────────────┐  ┌──────────────┐ │
│  │ 静态文件 (out/)       │  │ _worker.js   │ │
│  │ · 前端页面            │  │ · API 路由    │ │
│  │ · CSS/JS/图片         │  │ · 密码验证    │ │
│  └──────────────────────┘  └──────┬───────┘ │
│                                   │          │
└───────────────────────────────────┼──────────┘
                                    │
                          ┌─────────┴─────────┐
                          │  D1 数据库         │
                          │  blog-db           │
                          │  · posts           │
                          │  · diary           │
                          │  · todos           │
                          │  · schedule        │
                          │  · weight          │
                          │  · settings        │
                          └───────────────────┘
```

全部免费额度内：Pages 无限请求，D1 5GB + 500万读/月。

---

## 三、数据库表结构

```sql
settings    (key PRIMARY KEY, value)
posts       (slug PRIMARY KEY, title, content, excerpt, tags, created_at, updated_at)
diary       (date PRIMARY KEY, content, mood, tags, updated_at)
todos       (id PRIMARY KEY, text, done, priority, created_at, due_date)
schedule    (id PRIMARY KEY, title, date, time, duration, notes, created_at)
weight      (id PRIMARY KEY, date, weight, note, created_at)
```

密码存在 `settings` 表 key='password'，默认值 `blog2026`。

---

## 四、关键决策与踩坑

### 4.1 Workers vs Pages Functions vs _worker.js

**第一版**：独立 Cloudflare Workers 部署 API（`worker/` 目录，Hono 框架）
- 部署成功，域名 `blog-api.1752190332.workers.dev`
- **问题**：`*.workers.dev` 域名在国内被 DNS 污染/墙，浏览器 fetch 失败
- 结论：必须用 Pages 同域名

**第二版**：Cloudflare Pages Functions（`functions/api/[[route]].ts`，Hono）
- 同域名 `/api/*` 路由
- **问题**：Pages Functions 的 TypeScript 编译无法解析 Hono 依赖，Worker 抛异常（Error 1101）

**第三版**：`_worker.js`（项目根目录，纯 JavaScript，零依赖）
- Cloudflare Pages 原生支持 `_worker.js` 作为前置 Worker
- 手动路由匹配 `path.startsWith()`，无框架依赖
- **问题**：`_worker.js` 在项目根目录，但 Pages 只部署 `out/` 目录
- **解决**：构建命令改为 `npm run build && cp _worker.js out/`

### 4.2 前端路由变更

`output: 'export'` 静态导出不支持动态路由 `[slug]`，博客/日记改为查询参数：

```
/blog?slug=xxx      ← 文章详情
/blog?edit=1&slug=x ← 编辑文章
/blog?new=1         ← 新建文章
/diary?date=2026-05-18 ← 日记详情
/diary?edit=1&date=...  ← 编辑日记
/diary?new=1            ← 新建日记
```

### 4.3 useSearchParams 需要 Suspense

Next.js 14 静态导出时 `useSearchParams()` 会触发 CSR bailout 错误。解决：用 `<Suspense>` 包裹使用 `useSearchParams` 的组件。

### 4.4 认证设计

- 密码存 D1 settings 表
- 前端登录后存 `sessionStorage`（关浏览器即忘）
- 每次写请求 Header: `Authorization: Bearer <password>`
- Worker 端 `requireAuth` 中间件验证

### 4.5 乐观更新

hooks 采用乐观更新模式：先更新 UI，再发 API。失败时静默回滚。
```
setItems(prev => [...newItem, ...prev]);  // UI 立即更新
await api.createTodo(...).catch(() => {}); // API 调用
```

---

## 五、文件变更统计

### 新增（10 个）

```
_worker.js                          ← API 核心（零依赖纯 JS）
src/lib/api.ts                      ← 前端 API 客户端
src/components/ui/Editor.tsx        ← Markdown 编辑器
src/components/ui/PasswordGate.tsx  ← 密码弹窗
src/components/ui/Providers.tsx     ← Provider 包装
src/app/setup/page.tsx             ← 密码修改页
src/types/weight.ts                 ← 体重类型
src/hooks/useWeight.ts             ← 体重 hook
worker/                             ← Worker 项目（已被 _worker.js 取代）
  wrangler.toml / schema.sql / src/index.ts
```

### 改造（7 个）

```
src/hooks/useTodos.ts        ← localStorage → API
src/hooks/useSchedule.ts     ← localStorage → API
src/app/blog/page.tsx        ← fs 读取 → API，加编辑器
src/app/diary/page.tsx       ← 同上
src/app/page.tsx             ← 首页 API 化
src/app/globals.css          ← 动画 @keyframes
tailwind.config.ts           ← 花园色板
```

### 删除（10+ 个）

```
content/                     ← 所有 Markdown 和种子 JSON
public/data/                 ← 静态种子数据
src/lib/content.ts           ← 文件系统读取
src/hooks/useLocalStorage.ts ← 浏览器存储
src/app/blog/[slug]/         ← 动态路由（改用查询参数）
src/app/diary/[date]/        ← 同上
src/app/api/                 ← 旧 API 路由
```

---

## 六、部署流程

### Cloudflare 配置

| 设置 | 值 |
|---|---|
| Build command | `npm run build && cp _worker.js out/` |
| Output directory | `out` |
| D1 binding | 变量名 `DB`，数据库 `blog-db` |

### D1 绑定配置

```
通过 Cloudflare API 配置：
PATCH /accounts/:id/pages/projects/blog
{
  "deployment_configs": {
    "production": {
      "d1_databases": {
        "DB": { "id": "def4da5a-a599-41d9-b700-a0690903d51d" }
      }
    }
  }
}
```

同时需要在 API Token 中授权 D1 Edit 权限。

### 开发命令

```bash
npm run dev                          # 前端开发 (localhost:3000)
npm run build                        # 生产构建
git push origin master:main          # 部署

# Worker/DB 管理（需 Node 22+）
cd worker
npx wrangler deploy                  # 部署独立 Worker（备用）
npx wrangler d1 execute blog-db --file=schema.sql --remote  # 初始化数据库
```

---

## 七、数据流

### 读取（GET）
```
浏览器 fetch(/api/posts)
  → _worker.js 匹配 path
  → env.DB.prepare("SELECT ...").all()
  → JSON 响应
  → React 渲染
```

### 写入（POST/PUT/DELETE）
```
浏览器 fetch(/api/posts, { method: POST, body, headers: { Authorization } })
  → _worker.js 验证密码
  → env.DB.prepare("INSERT/UPDATE/DELETE ...").run()
  → JSON 响应
  → React 更新 UI
```

---

## 八、后续可做

| 项目 | 说明 |
|---|---|
| R2 图片存储 | 需创建 R2 bucket + 更新 API Token 权限 |
| 图片上传组件 | Editor 中拖拽上传 |
| 日记密码保护 | 单独密码（目前共用主密码） |
| 博客全文搜索 | fuse.js 客户端搜索 |
| 评论系统 | Giscus |
| RSS 订阅 | 动态生成 |
