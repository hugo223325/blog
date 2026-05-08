---
name: "数字花园博客"
description: "一座温暖的数字花园 — 像翻阅旧书般的个人博客体验"
colors:
  page-cream: "#faf7f2"
  page-warm: "#f3efe8"
  page-sand: "#ede4d9"
  ink-primary: "#2c2416"
  ink-secondary: "#6b5e4f"
  ink-muted: "#9b9284"
  sage: "#7a9a7e"
  sage-soft: "#e8f0e4"
  terracotta: "#c17d5e"
  terracotta-soft: "#faf0e8"
  lavender: "#b8a5c2"
  lavender-soft: "#f4f0f7"
typography:
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Georgia, 'Noto Serif SC', 'Source Han Serif SC', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink-primary}"
    textColor: "{colors.page-cream}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
    typography: "{typography.label}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
    typography: "{typography.label}"
  card-default:
    backgroundColor: "{colors.page-cream}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  chip-default:
    backgroundColor: "{colors.page-warm}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.full}"
    typography: "{typography.label}"
    padding: "4px 12px"
---

# Design System: 数字花园博客

## 1. Overview

**Creative North Star: "旧书纸页"**

这不是一个冰冷的工具界面，而是一本被翻过很多次的旧书。纸页微微泛黄，墨色温暖不刺眼，翻阅时安静而有触感。像在午后窗边翻开一本用了多年的笔记本——舒适、熟悉、让人安心。

系统用暖调纸色取代纯白，用深棕墨色取代纯黑，用花园色调（鼠尾草绿、陶土橙、薄紫）来点缀重点，但绝不喧宾夺主。衬线正文带来阅读的节奏感，无衬线标题则保持清晰的层次。

**Key Characteristics:**
- 暖纸底色，零纯白零纯黑
- 衬线正文 + 无衬线标题，阅读如翻书
- 花园色板点缀，克制不刺眼
- 无阴影，用色调分层传达深度
- 圆角柔和，间距宽松，节奏从容

PRODUCT.md 的反面教材在此落地为硬性禁令：没有任何 SaaS 卡片网格、数据大盘元素、暗黑科技色调、Glassmorphism 效果。

## 2. Colors: 纸页与花园

整个色板建立在一本旧书的隐喻之上：**纸页**构成中性基础，**墨色**承载文字，**花园色调**提供克制的情绪。

### Neutral — 纸页与墨色
- **page-cream** (#faf7f2): 默认页面背景。像略微泛黄的纸，暖但不黄。
- **page-warm** (#f3efe8): 卡片、区块背景。比 page-cream 稍深，用来区隔层次。
- **page-sand** (#ede4d9): 悬停态、选中态、分割线。最深的中性底色。
- **ink-primary** (#2c2416): 正文、标题。暖调深棕，替代纯黑的温暖墨色。
- **ink-secondary** (#6b5e4f): 辅助文字、图标。中调灰棕。
- **ink-muted** (#9b9284): 占位符、禁用态、次要信息。不引人注意但保持可读。

### Accent — 花园色板
- **sage** (#7a9a7e): 鼠尾草绿。用于"完成"状态、链接、博客标签。安静、有机、不抢眼。
- **sage-soft** (#e8f0e4): 鼠尾草绿的浅底。用于成功/完成背景。
- **terracotta** (#c17d5e): 陶土橙。高优先级的强调色。温暖不刺眼。
- **terracotta-soft** (#faf0e8): 陶土橙的浅底。用于高优标签背景、温馨提示。
- **lavender** (#b8a5c2): 薄紫。日记/阅读相关的色标。给花园一点花的暗示。
- **lavender-soft** (#f4f0f7): 薄紫的浅底。日记卡片背景、阅读相关区块。

### Named Rules
**The No Pure Black Rule.** 系统任何位置不使用 #000 或 #fff。最深是 ink-primary (#2c2416)，最浅是 page-cream (#faf7f2)。

**The 5% Accent Rule.** 花园色板的三个强调色（sage、terracotta、lavender）中，任何一个在单个页面上占比不超过 5%。它们是指针，不是油漆桶。

**The Tonal Depth Rule.** 不使用阴影来表现层次。用 page-cream → page-warm → page-sand 的递进色调来区分不同的 Z 层。更深 = 更靠近读者。深色模式下同理。

## 3. Typography: 衬线的温度

**Display/Title Font:** system-ui, -apple-system, sans-serif
**Body Font:** Georgia, 'Noto Serif SC', serif

衬线正文 + 无衬线标题的经典搭配。衬线体给人阅读纸质书的节奏感和温度，无衬线标题则保持清晰的视觉层次和不冗余的现代感。中文环境下回退到思源宋体。

### Hierarchy
- **Display** (600, clamp(2rem, 5vw, 2.5rem), 1.2): 页面主标题。如博客详情页的标题。
- **Title** (600, 1.25rem, 1.3): 卡片标题、区块标题。
- **Body** (400, 1rem, 1.75): 正文。最大行宽 68ch，确保舒适的阅读节奏。
- **Label** (500, 0.75rem, 1.4, 0.02em): 标签、按钮文字、辅助标注。小号但清晰。

### Named Rules
**The 68ch Rule.** 博客和日记正文最大宽度 68 个字符。超出则居中对齐呼吸。更宽的屏幕不应该有更长的行。

**The Weight Pairing Rule.** 只使用两种字重：400（正文）和 600（标题）。不用 300/500/700/800，让层次清晰、不嘈杂。

## 4. Elevation: 无影的层次

不使用 box-shadow。旧书没有投影——书页之间的层次靠的是纸的颜色递进。

深浅通过背景色来传达：
- 页面根背景：page-cream
- 卡片/区块：page-warm
- 悬停/选中：page-sand
- 深色模式同理，用递进的暗色调

如果未来某个元素确实需要强调（如 Modal 遮罩），用 `backdrop-blur` + 半透明色，不用阴影。

## 5. Components

### Buttons
- **Shape:** 柔和的圆角 (md: 10px)。棱角分明和纸的气质冲突。
- **Primary:** ink-primary 背景 + page-cream 文字。像墨印在纸上。
- **Ghost:** 透明背景 + ink-secondary 文字。悬停时背景过渡到 page-sand。
- **Hover / Focus:** 0.2s ease 过渡。Focus-visible 用 2px 的 sage 色 outline-offset 环。无阴影、无 scale 变化。

### Chips / Tags
- **Style:** page-warm 背景 + ink-secondary 文字，full 圆角。
- **交互色:** 博客标签可用 sage-soft 背景 + sage 文字。高优先待办用 terracotta-soft + terracotta。

### Cards / Containers
- **Corner Style:** lg (16px)。比按钮更松弛，体现纸页的从容。
- **Background:** page-cream 或 page-warm，取决于所在层级。
- **Shadow Strategy:** 无。参考 Elevation 的 tonal depth。
- **Border:** 1px page-sand，仅在需要视觉分隔时使用。
- **Internal Padding:** lg (24px)。

### Inputs / Fields
- **Style:** 1px 实线 page-sand 描边，md 圆角，page-cream 背景。
- **Focus:** 边框变 ink-secondary，无发光。1px 描边切换就够了。
- **Placeholder:** ink-muted 颜色。

### Navigation
- **Desktop:** 顶部粘性导航，page-cream/80 背景 + backdrop-blur。链接 ink-secondary，当前页 ink-primary + 600 字重。
- **Mobile:** 底部固定 Tab 栏，page-cream 背景 + 顶部分割线。激活项 ink-primary 色。

### Empty States
- 不在空状态用灰色的大图标+文字。用暖调的简笔插画（线条风格，用 ink-muted 绘制），配合温暖的文字提示。
- 例："这里还没有日记。种下第一颗种子吧。"

## 6. Do's and Don'ts

### Do:
- **Do** 用 page-cream / page-warm / page-sand 递进来区分层次，不用阴影
- **Do** 正文用 Georgia 衬线体，最大 68ch 行宽
- **Do** 强调色（sage、terracotta、lavender）单个页面不超过 5% 面积
- **Do** 圆角用 md (10px) 或 lg (16px)，保持柔和的纸页气质
- **Do** 深色模式用递进的暖暗色调，保持纸页隐喻的一致体验
- **Do** 让内容自然排布，以主题分区而不是卡片网格

### Don't:
- **Don't** 使用 #000 纯黑或 #fff 纯白
- **Don't** 使用 box-shadow 表现层次
- **Don't** 用 SaaS 模板式的相同尺寸卡片网格（图标+标题+描述）
- **Don't** 使用侧边条纹边框（border-left > 1px 作为彩色强调）
- **Don't** 使用渐变文字（background-clip: text）
- **Don't** 使用 Glassmorphism（blur + 半透明卡片）
- **Don't** 用企业后台风格的深蓝侧边栏或数据大盘布局
