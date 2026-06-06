# UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 改进游戏 UI：添加 Your 头像/名称、Chip 式选项、叙事显示角色名、新增主题选择流程

**Architecture:** 扩展现有组件，不破坏现有架构；状态机新增 `theme` 阶段

**Tech Stack:** React + TypeScript + Tailwind CSS

---

### Task 1: 扩展 GamePhase 类型添加 theme 阶段

**Files:**
- Modify: `hooks/useGameState.ts:38-44`

- [ ] **Step 1: 修改 GamePhase 类型定义**

```typescript
export type GamePhase =
  | 'lobby'      // 冷群提示
  | 'theme'      // 主题选择 (新增)
  | 'loading'    // API 调用中
  | 'playing'    // 游戏中
  | 'ended';     // 结束
```

- [ ] **Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 3: 提交**

```bash
git add hooks/useGameState.ts
git commit -m "feat: add theme phase to GamePhase type"
```

---

### Task 2: 在 page.tsx 添加 theme 状态和流程控制

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 添加 theme 状态和 ThemeScreen 导入**

```typescript
// 在顶部导入中添加
import ThemeScreen from '@/components/ThemeScreen';

// 在 Home 组件内添加
const [theme, setTheme] = useState<string | null>(null);
```

- [ ] **Step 2: 修改 handleStart 函数进入 theme 阶段**

```typescript
const handleStart = () => {
  game.setPhase('theme');
};
```

- [ ] **Step 3: 修改 handleSelectTheme 函数**

```typescript
const handleSelectTheme = (selectedTheme: string) => {
  setTheme(selectedTheme);
  startQuest(PRESET_MEMBERS.map(m => m.name), selectedTheme);
};
```

- [ ] **Step 4: 在 JSX 中添加 ThemeScreen 渲染**

```tsx
{state.phase === 'theme' && (
  <ThemeScreen
    onSelect={handleSelectTheme}
    lang={lang}
  />
)}
```

- [ ] **Step 5: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 6: 运行开发服务器验证**

```bash
npm run dev
```

访问 http://localhost:3008，点击"开始冒险"应显示主题选择界面

- [ ] **Step 7: 提交**

```bash
git add app/page.tsx
git commit -m "feat: add theme selection flow"
```

---

### Task 3: 在 PlayingScreen 中为 Your 消息添加头像和名称

**Files:**
- Modify: `components/PlayingScreen.tsx:234-256`

- [ ] **Step 1: 在 isSelf 消息渲染中添加头像和名称**

找到 `{isSelf && ...` 这一部分，修改为：

```tsx
return (
  <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''} bubble-in`}>
    {isSelf && (
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#E8F8EE' }}>
          🫵
        </div>
        <span className="text-xs" style={{ color: '#1DB954', fontSize: 10 }}>You</span>
      </div>
    )}
    <div className={`flex flex-col gap-0.5 max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
      {!isSelf && <span className="text-xs px-1 font-medium" style={{ color: '#666666' }}>{msg.author}</span>}
      <div className={`${isSelf ? 'bubble-sent' : 'bubble-received'} text-sm`}>{msg.text}</div>
      {/* Inline dice result under an action bubble */}
      {msg.dice && (
        <div
          className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: msg.dice.color }}
        >
          <span>{msg.dice.emoji}</span>
          <span>D20 = {msg.dice.value}</span>
          <span className="opacity-90">· {msg.dice.label}</span>
        </div>
      )}
    </div>
  </div>
);
```

- [ ] **Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 3: 提交**

```bash
git add components/PlayingScreen.tsx
git commit -m "feat: show avatar and name for You messages"
```

---

### Task 4: 在叙事显示中添加角色名称

**Files:**
- Modify: `components/PlayingScreen.tsx:221-231`
- Modify: `hooks/useGameState.ts:236-260`

- [ ] **Step 1: 修改 useGameState 添加 lastActivePlayer 状态**

在 GameState 接口中添加：

```typescript
lastActivePlayer: { name: string; role: string } | null;
```

在 initialState 中添加：

```typescript
lastActivePlayer: null,
```

- [ ] **Step 2: 在 doRoll 函数中记录 lastActivePlayer**

在调用 setState 添加叙事之前，添加：

```typescript
// 记录上一个行动者，用于叙事显示
setState(s => ({ ...s, lastActivePlayer: activePlayer }));
```

完整片段：

```typescript
// 3) 旁白"正在输入" → 旁白
await delay(300);
setState(s => ({ ...s, narratorTyping: true, lastActivePlayer: activePlayer }));
await delay(900);
setState(s => ({
  ...s,
  narratorTyping: false,
  messages: [...s.messages, { id: nextId(), author: 'Narrator', avatar: '🎬', text: narration, kind: 'narration' as const }],
  lastRoll: { roll: d.value, label },
  round: s.round + 1,
}));
```

- [ ] **Step 3: 修改 PlayingScreen 叙事渲染显示角色名**

修改叙事渲染部分：

```tsx
{isNarration && (
  <div key={msg.id} className="narration-box bubble-in">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">🎬</span>
      <span className="text-xs" style={{ color: '#1DB954', fontWeight: '600', textTransform: uppercase' }}>
        Story{state.lastActivePlayer && state.lastActivePlayer.name !== 'You' ? ` — ${state.lastActivePlayer.name}'s move caused this:` : ''}
      </span>
    </div>
    <div className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>{msg.text}</div>
  </div>
)}
```

- [ ] **Step 4: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 5: 提交**

```bash
git add hooks/useGameState.ts components/PlayingScreen.tsx
git commit -m "feat: show active player name in narration"
```

---

### Task 5: 重构选项界面为 Chip 式，添加底部输入栏

**Files:**
- Modify: `components/PlayingScreen.tsx:272-324`

- [ ] **Step 1: 替换选项区域为 Chip 式布局**

完全替换 `{beatPhase === 'action' && activePlayer && isHuman && (...)}` 这一段：

```tsx
{beatPhase === 'action' && activePlayer && isHuman && (
  <div style={{ background: '#FFFFFF', borderTop: '1px solid #E5E5E0', boxShadow: '0 -1px 4px rgba(0,0,0,0.04)' }}>
    {/* 专属选项 */}
    <div style={{ padding: '12px 16px 8px' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>🎭 你的专属选项：</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {actionOptions.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleChooseAction(opt)}
            className="px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
            style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>

    {/* 底部输入栏 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px 12px' }}>
      <button
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{ backgroundColor: '#dcfce7', border: '2px solid #16a34a' }}
      >
        <span className="text-base">🎲</span>
      </button>

      <button
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{ backgroundColor: '#ede9fe', border: '2px solid #c4b5fd' }}
      >
        <span className="text-base">🔗</span>
      </button>

      <div
        className="flex-1 rounded-full px-4 py-2 text-sm cursor-pointer"
        style={{ backgroundColor: '#F0F0EB', color: '#999999' }}
      >
        选择你的行动...
      </div>

      <button
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{ backgroundColor: '#16a34a' }}
      >
        <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 2: 移除独立的 Roll 按钮**

删除 `{beatPhase === 'rolling' && isHuman && (...)}` 这一段（已不需要）

- [ ] **Step 3: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 4: 提交**

```bash
git add components/PlayingScreen.tsx
git commit -m "feat: replace action buttons with chips, add bottom input bar"
```

---

### Task 6: 手动测试完整流程

**Files:**
- None (manual testing)

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试主题选择流程**

1. 访问 http://localhost:3008
2. 点击"开始冒险"
3. 应显示主题选择界面
4. 选择一个主题（如 "Space Station SOS"）
5. 应进入 loading → playing 阶段

- [ ] **Step 3: 测试 Your 消息头像**

1. 等待轮到 Your turn
2. 选择一个行动 chip
3. 查看消息列表，Your 消息应显示头像 🫵 和名称 "You"

- [ ] **Step 4: 测试 Chip 选项**

1. 在 Your turn，点击一个 chip 选项
2. 应立即开始 Roll 动画（无单独按钮）

- [ ] **Step 5: 测试叙事角色名**

1. 完成一轮后，查看叙事消息
2. 应显示 "Story — {角色名}'s move caused this:"（NPC 行动时显示 NPC 名）

- [ ] **Step 6: 提交**

（如果测试通过，无需提交；如有修复，提交修复）

---

### Task 7: 可选 - 增强 GLM Prompt 让叙事更自然

**Files:**
- Modify: `lib/director.ts:84-88`

- [ ] **Step 1: 修改 buildRollPrompt 的 system prompt**

将：

```typescript
const system = `You are the Side Quest Game Master. A hero just acted and the dice decided their fate. Narrate the OUTCOME and record its lasting consequence. Output JSON ONLY (no markdown):
{"narration":"2-4 cinematic sentences: react to the action at the dice tier, show concrete consequences and rising stakes, weave in any pending Fate Cards, end on a hook","reactions":[{"member":"member name","text":"in-character one-liner, <=14 words"}],"consequence":"one lasting effect to remember (a clue, a changed location, a character's new status, or a relationship shift)","story_state_updates":{"known_clues":[],"relationships":[],"location_status":{},"character_status":{},"active_consequences":[]}}
Rules: REACTIONS ARE REQUIRED — include exactly ONE in-character line for EACH reacting member listed below; never return an empty reactions array. Continue from "Previously" and the current Story State for continuity; the consequence MUST persist and may affect other characters; only include story_state_updates that actually changed; reactions only from the given reacting members; English; dramatic, Gen Z; safe.`;
```

改为（可选，让 GLM 在叙事中自然嵌入角色名）：

```typescript
const system = `You are the Side Quest Game Master. A hero just acted and the dice decided their fate. Narrate the OUTCOME and record its lasting consequence. Output JSON ONLY (no markdown):
{"narration":"2-4 cinematic sentences: start by acknowledging ${active.name}'s action, then describe the outcome at the dice tier, show concrete consequences and rising stakes, weave in any pending Fate Cards, end on a hook","reactions":[{"member":"member name","text":"in-character one-liner, <=14 words"}],"consequence":"one lasting effect to remember (a clue, a changed location, a character's new status, or a relationship shift)","story_state_updates":{"known_clues":[],"relationships":[],"location_status":{},"character_status":{},"active_consequences":[]}}
Rules: REACTIONS ARE REQUIRED — include exactly ONE in-character line for EACH reacting member listed below; never return an empty reactions array. Continue from "Previously" and the current Story State for continuity; the consequence MUST persist and may affect other characters; only include story_state_updates that actually changed; reactions only from the given reacting members; English; dramatic, Gen Z; safe.`;
```

- [ ] **Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 3: 提交**

```bash
git add lib/director.ts
git commit -m "feat: enhance roll prompt to include active player in narration"
```

---

## Summary

修改的文件：
1. `hooks/useGameState.ts` - 添加 theme 状态和 lastActivePlayer
2. `app/page.tsx` - 添加主题选择流程
3. `components/PlayingScreen.tsx` - 头像/名称 + chip 选项 + 底部栏
4. `lib/director.ts` - (可选) prompt 增强

总计：约 7 个任务，每个任务独立可测试完成。