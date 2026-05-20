# 博客 Bug 修复 + UI 优化

**日期**: 2026-05-20

---

## 一、博客编辑失效修复

### 问题
博客编辑保存无效，UI 无报错但内容不变。

### 根因
博客页使用本地 `showAuth` 状态 + 自己渲染 `<PasswordGate>`，与全局 `AuthProvider` 不同步。在 Suspense 包裹下，PasswordGate → Editor 的状态切换存在竞态：
- `showAuth` 初始化为 `createMode`（仅新建模式为 true）
- 编辑模式下 `showAuth` = `false`，密码弹窗被跳过
- Editor 直接渲染，保存时 sessionStorage 无密码 → API 401 静默失败

### 修复
博客和日记统一使用全局 `ensureAuth()` 模式（与待办/日程/体重一致）：

```javascript
// 旧模式（有 bug）
const [showAuth, setShowAuth] = useState(createMode);
{showAuth && <PasswordGate onSuccess={() => setShowAuth(false)} />}

// 新模式
const { ensureAuth } = useAuth();
<button onClick={() => ensureAuth(() => setEditing(true))}>编辑</button>
{editing && <Editor />}
```

`ensureAuth()` 检查 sessionStorage 是否有密码 → 有则直接执行回调 → 无则显示 PasswordGate → 登录成功后执行回调。

涉及文件：
- `src/app/blog/page.tsx`
- `src/app/diary/page.tsx`
- `src/hooks/useAuth.tsx` — 新增 401 事件监听，自动清过期密码

---

## 二、401 自动重登

### 问题
密码修改后，sessionStorage 中旧密码生效，API 返回 401，操作静默失败。

### 修复
`src/lib/api.ts` 的 `request()` 函数：收到 401 时自动清 sessionStorage + dispatch `auth-needed` 事件 → AuthProvider 监听 → 下次操作弹出 PasswordGate。

---

## 三、侧边栏

### 实现
博客列表页改为 `max-w-5xl` + `flex flex-col lg:flex-row` 双栏布局：
- 左侧：文章列表 + 标签云
- 右侧：256px 侧边栏（`w-56`）sticky 定位
  - 标签列表（紧凑，带计数）
  - 关于卡片 + 修改密码链接

移动端（`<lg`）：侧边栏隐藏（`hidden lg:block`）

---

## 四、Giscus 评论

### 实现
博客详情页底部嵌入 Giscus 评论组件：
- 加载 `giscus.app/client.js` 脚本
- 映射模式：`pathname`（每篇文章独立评论）
- 主题：`preferred_color_scheme`（跟随系统深浅色）

### 待配置
需在 GitHub 启用 Discussions + 安装 Giscus App，然后去 https://giscus.app 获取真实 ID。

当前占位值在 `src/app/blog/page.tsx` 的 `Comments` 组件中。

---

## 五、密码安全

### 修复
`worker/schema.sql` 默认密码从 `blog2026` 改为 `changeme`，不再上传真实密码到 GitHub。

实际运行数据库密码不变（仍为 `blog2026`），直到用户通过 `/setup` 页面主动修改。

---

## 六、统一 Auth 模式对照

| 页面 | 旧模式 | 新模式 |
|---|---|---|
| 博客 | 本地 showAuth + PasswordGate | ensureAuth + editing state |
| 日记 | 同上 | 同上 |
| 待办 | ensureAuth ✅ | 不变 |
| 日程 | ensureAuth ✅ | 不变 |
| 体重 | ensureAuth ✅ | 不变 |
