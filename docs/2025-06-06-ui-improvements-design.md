# VibeRoles UI 改进设计

## 概述

改进游戏界面的交互和视觉体验，让玩家更清楚自己在游戏中的角色和行为如何影响故事。

## 改进内容

### 1. 你（You）的消息显示头像和名称

**当前**：Your 消息只显示右侧气泡，无头像/名称  
**改进**：显示头像 🫵 和名称 "You"，与 NPC 消息结构对称

**实现位置**：`components/PlayingScreen.tsx` 第 234-256 行  
**修改**：在 `isSelf` 分支中添加头像显示元素

```tsx
// 消息气泡外层添加头像
{isSelf && (
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#E8F8EE' }}>
    🫵
  </div>
)}
```

### 2. 选项选择界面改为 Chip 式

**当前**：全宽按钮列表 + 独立的 "Roll the die" 按钮  
**改进**：chip 式选项，点击后立即自动 Roll

**实现位置**：
- `components/PlayingScreen.tsx` 第 273-299 行（底部选项区域）
- 新增底部输入栏（参考 vibe-dice-demo）

**改进后的结构**：
```
┌─────────────────────────────────┐
│ [专属选项区域]                   │
│ 🎭 你的专属选项：                │
│ [🔍 Search] [⚡ Use ability]    │
│                                  │
│ [通用选项区域]                   │
│ 💬 Talk to someone               │
│                                  │
│ [底部输入栏]                     │
│ [🎲] [🔗] [输入框] [→]          │
└─────────────────────────────────┘
```

### 3. 叙事显示角色名称

**当前**：叙事只显示 "Story"  
**改进**：显示 "Story — {角色名}'s move caused this:"

**实现位置**：
- `components/PlayingScreen.tsx` 第 221-231 行（叙事渲染）
- `lib/director.ts` 第 84-88 行（prompt 构建，可选）

**修改**：在叙事标题中加入角色名信息

### 4. 新增主题选择流程

**当前**：Lobby → 直接开始游戏  
**改进**：Lobby → Theme Screen → Playing

**实现位置**：
- `app/page.tsx` 添加 `theme` 状态
- 使用现有的 `components/ThemeScreen.tsx`
- 流程状态：`lobby → theme → loading → playing`

**状态机修改**：
```tsx
type GamePhase = 'lobby' | 'theme' | 'loading' | 'playing' | 'ended';
```

## 技术细节

### 文件修改清单
1. `app/page.tsx` - 添加 theme 状态和流程控制
2. `components/PlayingScreen.tsx` - 消息头像 + chip 式选项
3. `lib/director.ts` - 叙事 prompt 增强（可选）

### 数据流
```
LobbyScreen
  → (点击开始冒险)
  → setPhase('theme')
  → ThemeScreen
    → (选择主题)
    → startQuest(members, theme)
  → setPhase('loading')
  → PlayingScreen
```

## 视觉风格
- 头像：32x32 圆形，`#E8F8EE` 背景
- Chip 选项：专属选项绿色背景，通用选项灰色背景
- 底部栏：白色背景，3 个圆形按钮 + 输入框

## 不变的部分
- 主题卡片样式（ThemeScreen 已实现，保持不变）
- 消息气泡的圆角和阴影
- 整体 Zymix 轻量风格