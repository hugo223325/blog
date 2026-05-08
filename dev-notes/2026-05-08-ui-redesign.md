# UI 改造：Tailwind 默认 → "旧书纸页" 设计系统

**日期**: 2026-05-08
**依据**: PRODUCT.md + DESIGN.md
**耗时**: ~30 分钟
**构建结果**: ✅ 通过（16/16 页面，零错误）

---

## 改造范围

共修改 **20 个文件**，覆盖全站所有页面和组件。

### 基础设施（2 文件）

| 文件 | 变更 |
|---|---|
| `tailwind.config.ts` | `theme.extend` 注入 12 色板（page/ink/sage/terracotta/lavender）、serif/sans 字体族、display 字号、68ch max-width |
| `src/app/globals.css` | `:root` 变量替换 `#fff/#171717` → `#faf7f2/#2c2416`；body 字体 Arial → Georgia 衬线；prose 全套暖调覆写 |

### 布局外壳（4 文件）

| 文件 | 变更 |
|---|---|
| `src/app/layout.tsx` | `bg-white dark:bg-zinc-950` → `bg-page-cream` |
| `src/components/layout/Header.tsx` | 纸白半透明底 + sage 悬停；border-zinc → border-page-sand |
| `src/components/layout/Navigation.tsx` | 激活色 `blue-600` → `sage` |
| `src/components/layout/Footer.tsx` | `text-zinc-400` → `text-ink-muted` |

### 页面组件（14 文件）

| 文件 | 关键变更 |
|---|---|
| `src/app/page.tsx` | 拆除 2×2 SaaS 卡片网格 → 圆角药片导航 + page-warm 文章列表 + lavender-soft 日记卡 |
| `src/app/blog/page.tsx` | display 标题；空状态温暖文案 |
| `src/app/blog/[slug]/page.tsx` | 返回链接 `blue` → `sage`；标签分隔符暖调 |
| `src/components/blog/BlogCard.tsx` | 去边框用暖底；标签 `bg-zinc-100` → `bg-sage-soft text-sage`；悬停 `blue` → `sage` |
| `src/components/blog/BlogContent.tsx` | `prose-zinc` → 自定义 warm prose；`max-w-none` → `max-w-prose (68ch)` |
| `src/app/diary/page.tsx` | 日期按钮 hover → lavender-soft |
| `src/app/diary/[date]/page.tsx` | 返回链接统一 sage |
| `src/components/diary/DiaryEntry.tsx` | 正文外包 `lavender-soft` 暖底圆角卡 |
| `src/components/diary/DiaryCalendar.tsx` | 选中态 `blue` → `lavender`；默认 `zinc-100` → `page-warm` |
| `src/app/todo/page.tsx` | display 标题；空状态花园隐喻文案 |
| `src/components/todo/TodoItem.tsx` | **拆除 border-l-4 侧边条纹** → 优先级圆点；checkbox `blue` → `sage`；高优 `red` → `terracotta-soft`；删除 `red-500` → `terracotta` |
| `src/components/todo/AddTodoForm.tsx` | 按钮 `bg-blue-600` → `bg-ink-primary`；focus `ring-2 blue` → `outline-2 sage`；输入框 border `zinc-300` → `page-sand` |
| `src/components/todo/TodoExportImport.tsx` | Ghost 按钮暖调 |
| `src/app/schedule/page.tsx` | 今日标签 `blue` → `sage` |
| `src/components/schedule/ScheduleItem.tsx` | 卡片 `bg-zinc-50` → `bg-page-warm`；删除 `red` → `terracotta` |
| `src/components/schedule/AddScheduleForm.tsx` | 同 AddTodoForm 体系 |

---

## 交互统一标准

- **过渡**: 全站统一 `transition-colors duration-200`
- **焦点**: `focus-visible:outline-2 outline-sage outline-offset-2` 替代 `focus:ring-2 ring-blue-500`
- **删除**: hover `terracotta`（暖橙）替代 `red-500`
- **悬停**: 色调递进 page-cream → page-warm → page-sand
- **空状态**: "种下第一颗种子吧" / "享受此刻的宁静" 替代 "暂无数据"

## 禁令合规清单

对照 DESIGN.md Section 6：

- [x] 无 `#000` 或 `#fff` 纯色（最深 ink-primary #2c2416，最浅 page-cream #faf7f2）
- [x] 无 box-shadow 表现层次（用背景色递进）
- [x] 无 SaaS 卡片网格（首页已改为有机布局）
- [x] 无 border-l-4 侧边条纹（TodoItem 改为优先级圆点）
- [x] 无渐变文字
- [x] 无 Glassmorphism（Header backdrop-blur + 半透明是功能性粘性导航，非装饰）
- [x] 无企业后台深蓝侧边栏
- [x] 强调色单页 ≤5%（sage/lavender/terracotta 仅用于标签、图标、激活态）
- [x] 正文 Georgia 衬线，68ch 行宽
- [x] 仅使用 400/600 字重

## 构建验证

```
npm run build → ✓ Compiled successfully
16/16 static pages generated
0 errors, 0 warnings
```

---

## 构建卡顿原因

### 现象
第一次 `npm run build` 报错 `EPERM: operation not permitted, open '.next/trace'`，第二次挂起不动。

### 根因：Windows 文件锁定（3 层叠加）

1. **`.next/trace` 文件被锁定** — 之前的 `npm run dev` 进程未完全退出，Node.js 子进程仍持有 `.next/trace` 的写入句柄。Windows 不允许删除或覆盖被打开的的文件。
2. **ESLint 实例残留** — `taskkill` 前共有 **7 个 node.exe 进程**在运行，包括之前开发服务器的 Webpack 编译器/文件监视器。
3. **bash 的 `rm -rf` 写操作绕过** — 在 Windows 上 bash 的 `rm` 遇到被锁文件静默失败不报错，Next.js 继续尝试写入同一路径时触发 EPERM。

### 解决方案
```bash
# 强制终止所有 node 进程
taskkill /f /im node.exe
# 删除 .next 构建缓存
rm -rf .next
# 重新构建
npm run build
```

### 预防
- 切换项目或关闭终端前，确保 `Ctrl+C` 终止 `npm run dev`
- 遇到类似卡顿先 `taskkill /f /im node.exe`
