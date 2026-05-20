# GitHub 被墙时的直接部署方案

**日期**: 2026-05-19

---

## 问题

GitHub.com HTTPS (port 443) 被 GFW 干扰，表现为：
- `ping github.com` 通（88ms）
- `git push` 报 `Empty reply from server` 或 `Could not connect to server`

但 SSH (port 22) 可以连通 GitHub。

---

## 解决方案：wrangler pages deploy 直接上传

绕过 GitHub，用 Wrangler CLI 直接把构建产物上传到 Cloudflare Pages。

### 前提

- Wrangler CLI 已安装（需 Node 22+）
- Cloudflare API Token 已配置
- Cloudflare Pages 项目 `blog` 已创建
- D1 数据库 `blog-db` 已绑定到 Pages 项目

### 操作步骤

```bash
# 1. 切换到 Node 22
nvm use 22.22.3

# 2. 构建前端
npm run build

# 3. 复制 _worker.js 到输出目录
cp _worker.js out/

# 4. 设置 API Token（如果还没设）
export CLOUDFLARE_API_TOKEN=cfut_YOUR_CLOUDFLARE_API_TOKEN_HERE

# 5. 直接部署到 Cloudflare Pages
npx wrangler pages deploy out/ --project-name=blog --branch=main
```

部署完成后输出类似 `https://c9d070a8.blog-7mr.pages.dev`，主域名 `blog-7mr.pages.dev` 也会更新。

---

## 原理

```
正常流程： git push → GitHub → Cloudflare 自动构建 → 部署
                                    ↑ 被墙

绕路流程： wrangler pages deploy out/ → 直接上传到 Cloudflare Pages
           不走 GitHub，通过 Cloudflare API (api.cloudflare.com) 直接推送构建产物
```

Cloudflare API (`api.cloudflare.com`) 和 Pages 上传端点在国内通常可以访问。

`wrangler pages deploy` 做的事：
1. 压缩 `out/` 目录
2. 通过 Cloudflare API 上传文件
3. Cloudflare 编译 `_worker.js`（Workers 运行时）
4. 分发到全球 CDN

---

## SSH 密钥（备用方案）

已生成 SSH 密钥用于后续 git push：

```
密钥位置: ~/.ssh/id_ed25519
公钥: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKQjMmExJrrsJK5Ob+q4BB2GE7Nt2c7utnGO4yjIkdwD hugo223325@github
```

需将公钥添加到 GitHub 账号后才能用 `git@github.com:hugo223325/blog.git` (SSH) 推送。

添加方法：
1. 打开 https://github.com/settings/keys（可能需要全局代理）
2. New SSH Key → 粘贴公钥
3. 之后即可用 `git push origin master:main` 通过 SSH 推送

---

## Cloudflare API Token

```
cfut_YOUR_CLOUDFLARE_API_TOKEN_HERE
```

保存在 `worker/.dev.vars`（已 gitignore）。

权限：Workers Scripts Edit + D1 Edit。如需 R2 需添加 R2 Storage Edit。

---

## 常用命令速查

```bash
# 构建 + 部署一步完成
npm run build && cp _worker.js out/ && \
  export CLOUDFLARE_API_TOKEN=cfut_YOUR_CLOUDFLARE_API_TOKEN_HERE && \
  npx wrangler pages deploy out/ --project-name=blog --branch=main

# Worker 单独部署（备用）
cd worker && export CLOUDFLARE_API_TOKEN=cfut_xxx && npx wrangler deploy

# D1 操作
cd worker && npx wrangler d1 execute blog-db --command="SELECT * FROM todos" --remote
npx wrangler d1 execute blog-db --file=schema.sql --remote  # 初始化/重置

# 查看 Pages 项目信息
npx wrangler pages project list
```
