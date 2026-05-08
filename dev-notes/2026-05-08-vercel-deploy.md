# Vercel 部署指南

日期：2026-05-08
状态：待部署

## 部署步骤

1. 将项目推送到 GitHub：
   ```bash
   git remote add origin <repo-url>
   git push -u origin main
   ```

2. 登录 [vercel.com](https://vercel.com)，点击 "New Project"

3. 导入 GitHub 仓库，Vercel 自动识别 Next.js 项目

4. 构建配置（通常自动检测，无需修改）：
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. 点击 Deploy

6. 部署完成后获得 `*.vercel.app` 域名

## 注意事项

- 无环境变量需要配置（MVP 版本）
- 每次 `git push` 到 main 分支自动触发部署
- 静态页面（博客/日记）预渲染到 CDN 边缘节点
- API 路由（seed-data）作为 Serverless Functions 运行
- Service Worker 需要 HTTPS（Vercel 自动提供）

## 首次部署后

1. 在手机浏览器访问 Vercel 域名
2. 添加到主屏幕（Android：自动提示；iOS：Safari → 分享 → 添加到主屏幕）
3. 测试离线访问：打开飞行模式 → 刷新页面
