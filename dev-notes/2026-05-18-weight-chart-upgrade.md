# 体重图表可视化升级

**日期**: 2026-05-18
**构建结果**: ✅ 16/16 页面，零错误

---

## 改进内容

### 1. 平滑贝塞尔曲线
- 折线 → Catmull-Rom 三次贝塞尔插值
- 张力参数 0.35，曲线自然流畅
- 单点显示为点，两点用二次贝塞尔，三点以上用 Catmull-Rom

### 2. 线条绘制动画
- `stroke-dasharray` 设为路径长度 + `stroke-dashoffset` CSS 动画
- 线条从左到右"生长"出现，持续 1.2s
- 切换时间范围（7d/30d/90d/全部）触发重新动画

### 3. 交互式 Tooltip
- `onMouseMove` 追踪鼠标，找最近数据点（水平距离 < 40px）
- 竖线指示器（半透明 sage 虚线）
- 浮动卡片：日期、体重、BMI、备注
- 移动端 `onTouchMove` / `onTouchEnd` 支持
- `cursor-crosshair` 暗示可交互

### 4. 数据点动效
- 最新点：呼吸光环（`@keyframes pulse`，r 5→10，opacity 0.4→0）
- 悬停点：scale 3→5.5 + 外圈 12px 半透明扩散
- 其余点：r=3，悬停放大，`transition` 平滑

### 5. 渐变优化
- 2 阶 → 3 阶：α=0.18 → α=0.06 → α=0

### 6. 智能 Y 轴刻度
- nice ticks 算法：自动取整到美观数值
- 最多 4 条水平参考线

---

## Bug 修复

### React #310 — hooks 顺序错误

**问题**：`lineLen` 的 `useMemo` 和 `findNearest` 的 `useCallback` 放在了 `if (filtered.length === 0) return` 之后。空数据时跳过这些 hooks，有数据时多调用 —— hooks 数量不一致，React 崩溃。

**修复**：所有 hooks（`useRef`, `useState`, `useEffect`, `useMemo`, `useCallback`）移到条件返回之前。`lineLen` 从 `useMemo` 改为 IIFE 普通计算。

**教训**：React hooks 必须在每次渲染中以完全相同顺序调用。条件返回后不能再有 hooks。

---

## 涉及文件

| 文件 | 变更 |
|---|---|
| `src/components/weight/WeightChart.tsx` | 完全重写（贝塞尔 + 动画 + tooltip + hook fix） |
| `src/app/globals.css` | 新增 `@keyframes drawLine`, `pulse`, `tooltipIn` |
| `src/app/weight/page.tsx` | 传递 `height` prop 给 Chart |

---

## 本地种子数据更新

`public/data/weight.json` 是种子数据，仅在首次使用 localStorage 为空时加载。后续更新数据需手动清除浏览器 localStorage（F12 → Application → Local Storage → 删除 `blog-weight`）。
