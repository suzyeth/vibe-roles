# Vibe Dice 实现计划（Implementation Plan）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (推荐) 或 superpowers:executing-plans 逐任务实现。步骤用 `- [ ]` 复选框跟踪。

**Goal:** 24h 内做出 Vibe Dice 单屏 Web 原型——冷群一键开启 3 分钟 AI 骰子冒险：AI 生成 quest + 角色，投骰子推进剧情，外部好友通过 share link 用 Fate Card 干预，AI 编入下一轮，结束生成可分享 Quest Card。

**Architecture:** 复用现有 Next.js 14 + TS + Tailwind + Zod + Vitest + GLM 客户端 + `GLM_OFFLINE` 兜底骨架。可测纯逻辑（骰子映射、schema、兜底、prompt 构建、内存 quest store）放 `lib/` 做 TDD；API route 薄编排；主页面是 quest 状态机（cold → 开场 → 投骰循环×3 → 结局 → QuestCard）；新增 `app/q/[id]` 外部好友干预页。无真实后端：用模块级内存 store 在单个 dev 进程内串联主游戏与干预页（demo 足够；非 serverless 持久化，已知局限）。

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, Zod, Vitest, GLM(OpenAI 兼容), html-to-image(卡片导出), Fotor(营销/精修卡)。

> 本计划 **替换** 旧「Vibe Roles」实现。复用：`lib/glm.ts`、`lib/env.ts`、`lib/cardExport.ts`、`components/MessageBubble.tsx`、`components/MiniAppBar.tsx`、`components/DeadGroup.tsx`、`data/members.ts`、`data/deadGroup.ts`。替换：`lib/schema.ts`、`lib/director.ts`、`lib/fallback.ts`、`app/api/*`、`app/page.tsx` 及其测试。删除：`app/api/scene|narrate|round|highlight`、`components/RoleCardList`(可留作复用)、旧 Scene/Round 测试。

---

## 文件结构（最终）
```
lib/
  dice.ts          骰子点数→标签（纯，TDD）
  schema.ts        Quest/Player/FateCard/RoundResult/QuestCard（纯，TDD）
  fallback.ts      quest/roll/fate/questcard 兜底（纯，TDD）
  director.ts      4 个 prompt 构建器（纯，TDD）
  questStore.ts    内存 quest store（纯，TDD）
  glm.ts           复用
  env.ts           复用
  cardExport.ts    复用
app/api/
  quest/route.ts     开局：生成 quest 并入 store
  roll/route.ts      投骰子：读 store + fate cards → 推进剧情
  fate/route.ts      好友输入 → FateCard → 入 store
  questcard/route.ts 结束：生成 Quest Card
app/
  page.tsx          quest 状态机（主游戏）
  q/[id]/page.tsx   外部好友 Fate Card 干预页
components/
  DiceRoller.tsx, RollResultBanner.tsx, FateCardList.tsx, QuestCard.tsx
  MessageBubble.tsx, MiniAppBar.tsx, DeadGroup.tsx（复用）
data/
  quest.ts          quest 主题 + Fate Card 示例
  members.ts, deadGroup.ts（复用）
tests/
  dice.test.ts, schema.test.ts, fallback.test.ts, director.test.ts, questStore.test.ts
```

---

## Phase 0 · 清理与准备

### Task 0: 移除旧 Vibe Roles 模块，留干净底座
**Files:** 删除 `app/api/scene|narrate|round|highlight/route.ts`、`tests/schema.test.ts`(旧)、`tests/director.test.ts`(旧)、`tests/fallback.test.ts`(旧)、`tests/env.test.ts`(保留)。

- [ ] **Step 1:** 删除旧 API 路由目录与旧的 scene/round/narrate/highlight 实现。
  Run: `git rm -r app/api/scene app/api/narrate app/api/round app/api/highlight`
- [ ] **Step 2:** 清空旧 schema/director/fallback 的 Vibe Roles 专有测试（保留 `tests/env.test.ts`）。后续 Phase 会写新测试覆盖。
  Run: `git rm tests/schema.test.ts tests/director.test.ts tests/fallback.test.ts`
- [ ] **Step 3:** `app/page.tsx` 暂时替换为占位（避免引用已删模块导致 build 失败）：
```tsx
export default function Home() {
  return <main className="p-8 text-center">Vibe Dice — building…</main>;
}
```
- [ ] **Step 4:** `npm run build` 确认无残留引用错误（旧组件若仍被引用则一并清理）。
- [ ] **Step 5:** Commit: `chore: remove Vibe Roles modules to make room for Vibe Dice`

---

## Phase 1 · 骰子系统（TDD）

### Task 1: lib/dice.ts
**Files:** Create `lib/dice.ts`; Test `tests/dice.test.ts`
- [ ] **Step 1: 写失败测试 `tests/dice.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { rollLabel, clampD20 } from "@/lib/dice";
describe("rollLabel", () => {
  it("边界映射正确", () => {
    expect(rollLabel(1)).toBe("Total Chaos");
    expect(rollLabel(5)).toBe("Awkward Fail");
    expect(rollLabel(6)).toBe("Messy Progress");
    expect(rollLabel(10)).toBe("Messy Progress");
    expect(rollLabel(11)).toBe("Works Somehow");
    expect(rollLabel(15)).toBe("Works Somehow");
    expect(rollLabel(16)).toBe("Main Character Moment");
    expect(rollLabel(19)).toBe("Main Character Moment");
    expect(rollLabel(20)).toBe("Iconic Roll");
  });
});
describe("clampD20", () => {
  it("夹到 1..20 且取整", () => {
    expect(clampD20(0)).toBe(1);
    expect(clampD20(25)).toBe(20);
    expect(clampD20(7.9)).toBe(7);
  });
});
```
- [ ] **Step 2:** `npm test tests/dice.test.ts` → FAIL（找不到模块）
- [ ] **Step 3: 写 `lib/dice.ts`**
```ts
export type RollLabel = "Total Chaos" | "Awkward Fail" | "Messy Progress" | "Works Somehow" | "Main Character Moment" | "Iconic Roll";
export function rollLabel(n: number): RollLabel {
  if (n <= 1) return "Total Chaos";
  if (n <= 5) return "Awkward Fail";
  if (n <= 10) return "Messy Progress";
  if (n <= 15) return "Works Somehow";
  if (n <= 19) return "Main Character Moment";
  return "Iconic Roll";
}
export function clampD20(n: number): number {
  return Math.max(1, Math.min(20, Math.floor(n)));
}
```
- [ ] **Step 4:** `npm test tests/dice.test.ts` → PASS
- [ ] **Step 5:** Commit: `feat: dice roll-to-label mapping`

---

## Phase 2 · Schema（TDD）

### Task 2: lib/schema.ts
**Files:** Replace `lib/schema.ts`; Test `tests/schema.test.ts`
- [ ] **Step 1: 写失败测试 `tests/schema.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { QuestSchema, FateCardSchema, QuestCardSchema, PlayerSchema } from "@/lib/schema";
const quest = { scene: { theme: "The Unread Beast", setup: "silence...", tone: "playful" }, players: [{ name: "Xiaomin", role: "Wizard", ability: "detect awkwardness", status: "active" }], goal: "revive chat" };
describe("QuestSchema", () => {
  it("接受合法 quest", () => { expect(QuestSchema.parse(quest)).toBeTruthy(); });
  it("拒绝 players 为空", () => { expect(() => QuestSchema.parse({ ...quest, players: [] })).toThrow(); });
});
describe("FateCardSchema", () => {
  it("接受合法 + 套用默认", () => {
    const c = FateCardSchema.parse({ type: "curse", title: "Food Metaphor", effect: "..." });
    expect(c.tone).toBe("chaotic but harmless"); expect(c.trigger).toBe("next_round");
  });
  it("拒绝非白名单 type", () => { expect(() => FateCardSchema.parse({ type: "explosion", title: "x", effect: "y" })).toThrow(); });
});
describe("QuestCardSchema", () => {
  it("接受合法 questcard", () => { expect(QuestCardSchema.parse({ title: "Quest Completed", caption: "alive", best_interference: "Food Metaphor", final_roll: 18, cta: "open zymix" })).toBeTruthy(); });
});
describe("PlayerSchema", () => {
  it("status 默认 active", () => { expect(PlayerSchema.parse({ name: "A", role: "R", ability: "x" }).status).toBe("active"); });
});
```
- [ ] **Step 2:** `npm test tests/schema.test.ts` → FAIL
- [ ] **Step 3: 写 `lib/schema.ts`**
```ts
import { z } from "zod";

export const FATE_TYPES = ["character", "object", "curse", "rule", "blessing"] as const;
export const FateCardSchema = z.object({
  type: z.enum(FATE_TYPES),
  title: z.string().min(1),
  effect: z.string().min(1),
  tone: z.string().min(1).default("chaotic but harmless"),
  trigger: z.string().min(1).default("next_round"),
  source_friend: z.string().optional(),
});
export type FateCard = z.infer<typeof FateCardSchema>;

export const PlayerSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  ability: z.string().min(1),
  status: z.enum(["active", "sleeping_npc", "npc"]).default("active"),
});
export type Player = z.infer<typeof PlayerSchema>;

export const QuestSchema = z.object({
  scene: z.object({ theme: z.string().min(1), setup: z.string().min(1), tone: z.string().min(1) }),
  players: z.array(PlayerSchema).min(1),
  goal: z.string().min(1),
});
export type Quest = z.infer<typeof QuestSchema>;

export const RoundResultSchema = z.object({ narration: z.string().min(1), advance: z.boolean().default(true) });
export type RoundResult = z.infer<typeof RoundResultSchema>;

export const QuestCardSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
  best_interference: z.string().min(1),
  final_roll: z.number().int(),
  cta: z.string().min(1),
});
export type QuestCard = z.infer<typeof QuestCardSchema>;
```
- [ ] **Step 4:** `npm test tests/schema.test.ts` → PASS
- [ ] **Step 5:** Commit: `feat: Vibe Dice schemas (Quest/FateCard/QuestCard)`

---

## Phase 3 · 兜底（TDD）

### Task 3: lib/fallback.ts
**Files:** Replace `lib/fallback.ts`; Test `tests/fallback.test.ts`
- [ ] **Step 1: 写失败测试 `tests/fallback.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { fallbackQuest, fallbackRoundResult, fallbackFateCard, fallbackQuestCard } from "@/lib/fallback";
import { QuestSchema, FateCardSchema, RoundResultSchema, QuestCardSchema } from "@/lib/schema";
describe("fallbackQuest", () => {
  it("players 数=成员数且通过 schema", () => {
    const q = fallbackQuest(["A", "B"]);
    expect(q.players).toHaveLength(2); expect(QuestSchema.parse(q)).toBeTruthy();
  });
  it("空成员也产出合法 quest", () => { expect(QuestSchema.parse(fallbackQuest([]))).toBeTruthy(); });
});
describe("fallbackRoundResult", () => {
  it("各 roll 都给非空旁白且通过 schema", () => {
    for (const r of [1, 4, 7, 13, 18, 20]) expect(RoundResultSchema.parse(fallbackRoundResult(r, []))).toBeTruthy();
  });
});
describe("fallbackFateCard", () => {
  it("用输入做标题且通过 schema", () => {
    const c = fallbackFateCard("A jealous duck", 0);
    expect(c.title.length).toBeGreaterThan(0); expect(FateCardSchema.parse(c)).toBeTruthy();
  });
});
describe("fallbackQuestCard", () => {
  it("通过 schema", () => { expect(QuestCardSchema.parse(fallbackQuestCard(18, "Food Metaphor"))).toBeTruthy(); });
});
```
- [ ] **Step 2:** `npm test tests/fallback.test.ts` → FAIL
- [ ] **Step 3: 写 `lib/fallback.ts`**
```ts
import type { Quest, FateCard, RoundResult, QuestCard } from "@/lib/schema";
import { rollLabel } from "@/lib/dice";

const ROLE_POOL = [
  { role: "The Overthinking Wizard", ability: "Detect hidden awkwardness" },
  { role: "The Ghost Rogue", ability: "Return from unread messages" },
  { role: "The Chaos Bard", ability: "Turn silence into a song" },
  { role: "The Snack Healer", ability: "Restore morale with chips" },
];
export function fallbackQuest(members: string[]): Quest {
  const names = members.length ? members : ["你"];
  return {
    scene: { theme: "The Unread Beast", setup: "The chat has fallen into silence. The Unread Beast has stolen the last topic.", tone: "chaotic, playful, safe" },
    players: names.map((n, i) => ({ name: n, role: ROLE_POOL[i % ROLE_POOL.length].role, ability: ROLE_POOL[i % ROLE_POOL.length].ability, status: "active" as const })),
    goal: "Recover the stolen topic and revive the chat.",
  };
}
const NARR: Record<string, string> = {
  "Total Chaos": "灾难性翻车，全场陷入最荒谬的混乱。",
  "Awkward Fail": "失败了，但场面尴尬到好笑。",
  "Messy Progress": "勉强推进，但留下了一个麻烦。",
  "Works Somehow": "莫名其妙成功了，只是埋了个雷。",
  "Main Character Moment": "高光时刻，你强势扭转了局面。",
  "Iconic Roll": "史诗级大成功，全场封神。",
};
export function fallbackRoundResult(roll: number, _fate: FateCard[]): RoundResult {
  return { narration: NARR[rollLabel(roll)] ?? "故事继续推进……", advance: true };
}
const MOCK_FATE: FateCard[] = [
  { type: "curse", title: "Food Metaphor Mode", effect: "All future dialogue must sound like dinner is a psychological condition.", tone: "chaotic but harmless", trigger: "next_round" },
  { type: "character", title: "The Sunglasses Pigeon", effect: "Offers suspicious advice but demands chips.", tone: "chaotic but harmless", trigger: "roll_under_10" },
];
export function fallbackFateCard(input: string, seed: number): FateCard {
  const base = MOCK_FATE[((seed % MOCK_FATE.length) + MOCK_FATE.length) % MOCK_FATE.length];
  return { ...base, title: (input || base.title).slice(0, 24) };
}
export function fallbackQuestCard(finalRoll: number, bestInterference: string): QuestCard {
  return { title: "Quest Completed", caption: "chaotic but alive", best_interference: bestInterference || "—", final_roll: finalRoll, cta: "Start your own quest on Zymix" };
}
```
- [ ] **Step 4:** `npm test tests/fallback.test.ts` → PASS
- [ ] **Step 5:** Commit: `feat: Vibe Dice fallbacks (quest/round/fate/questcard)`

---

## Phase 4 · Prompt 构建器（TDD）

### Task 4: lib/director.ts
**Files:** Replace `lib/director.ts`; Test `tests/director.test.ts`
- [ ] **Step 1: 写失败测试 `tests/director.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { buildQuestPrompt, buildRollPrompt, buildFateCardPrompt, buildQuestCardPrompt } from "@/lib/director";
describe("director prompts", () => {
  it("buildQuestPrompt 含成员与主题，要求 JSON", () => {
    const { system, user } = buildQuestPrompt(["Xiaomin", "Emma"], "The Unread Beast");
    expect(system).toContain("JSON"); expect(user).toContain("Xiaomin"); expect(user).toContain("The Unread Beast");
  });
  it("buildRollPrompt 含 roll 标签与 fate 标题", () => {
    const { user } = buildRollPrompt("silence", "Messy Progress", [{ type: "curse", title: "Food Metaphor", effect: "x", tone: "t", trigger: "next_round" }], "前情");
    expect(user).toContain("Messy Progress"); expect(user).toContain("Food Metaphor");
  });
  it("buildFateCardPrompt 含类型与输入，要求 JSON", () => {
    const { system, user } = buildFateCardPrompt("curse", "everyone speaks in food metaphors");
    expect(system).toContain("JSON"); expect(user).toContain("curse"); expect(user).toContain("food metaphors");
  });
  it("buildQuestCardPrompt 含 finalRoll", () => {
    const { user } = buildQuestCardPrompt("打败了野兽", 18, ["Food Metaphor"]);
    expect(user).toContain("18");
  });
});
```
- [ ] **Step 2:** `npm test tests/director.test.ts` → FAIL
- [ ] **Step 3: 写 `lib/director.ts`**
```ts
import type { FateCard } from "@/lib/schema";

export function buildQuestPrompt(members: string[], theme: string) {
  const system = `你是 Vibe Dice 的 AI 主持人。生成一个 3 分钟微型冒险的开场。
严格只输出 JSON（不要 markdown）：{"scene":{"theme":"...","setup":"<=40字开场","tone":"chaotic, playful, safe"},"players":[{"name":"成员名","role":"轻松角色名","ability":"一句能力","status":"active"}],"goal":"<=20字目标"}
规则：players 数量=成员数；角色风趣(如 The Ghost Rogue/The Snack Healer)；中文+英文角色名皆可；Gen Z 语气；安全，不得暴力/露骨/仇恨。`;
  const user = `主题：${theme || "随机"}\n在场成员：${members.join("、")}`;
  return { system, user };
}

export function buildRollPrompt(sceneSetup: string, label: string, fateCards: FateCard[], recent: string) {
  const fate = fateCards.length ? fateCards.map((f) => `${f.type}:${f.title}(${f.effect})`).join("；") : "无";
  const system = `你是 Vibe Dice 主持人。根据骰子结果标签推进剧情一段(<=50字)，必须体现该标签的成败基调，并把"待生效 Fate Card"自然编进剧情。只输出旁白文本本身。中文，戏剧感，Gen Z 语气，安全。`;
  const user = `场景：${sceneSetup}\n前情：${recent}\n骰子结果：${label}\n待生效 Fate Cards：${fate}`;
  return { system, user };
}

export function buildFateCardPrompt(type: string, input: string) {
  const system = `你把好友的一句自由输入转成结构化 Fate Card。严格只输出 JSON：{"type":"character|object|curse|rule|blessing","title":"<=12字","effect":"一句话效果","tone":"chaotic but harmless","trigger":"next_round|roll_under_10"}
规则：type 必须等于给定类型；effect 安全、好玩、可被主持人编入剧情；过滤暴力/露骨/仇恨/人身攻击。`;
  const user = `类型：${type}\n好友输入：${input}`;
  return { system, user };
}

export function buildQuestCardPrompt(summary: string, finalRoll: number, fateTitles: string[]) {
  const system = `你给一局 Vibe Dice 生成可分享结果卡。严格只输出 JSON：{"title":"Quest Completed","caption":"<=10字气氛词","best_interference":"最出彩的 Fate Card 标题","final_roll":数字,"cta":"Start your own quest on Zymix"}`;
  const user = `结局摘要：${summary}\n最终骰子：${finalRoll}\n候选 Fate Cards：${fateTitles.join("、") || "无"}`;
  return { system, user };
}
```
- [ ] **Step 4:** `npm test tests/director.test.ts` → PASS
- [ ] **Step 5:** Commit: `feat: Vibe Dice prompt builders`

---

## Phase 5 · 内存 Quest Store（TDD）

### Task 5: lib/questStore.ts
**Files:** Create `lib/questStore.ts`; Test `tests/questStore.test.ts`
> 说明：模块级 Map，单进程内串联主游戏与好友干预页。dev 单进程足够；非持久化，已知局限。
- [ ] **Step 1: 写失败测试 `tests/questStore.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { createQuest, getQuest, addFateCard, listFateCards } from "@/lib/questStore";
const quest = { scene: { theme: "t", setup: "s", tone: "x" }, players: [{ name: "A", role: "R", ability: "y", status: "active" as const }], goal: "g" };
describe("questStore", () => {
  it("create + get", () => { createQuest("q1", quest); expect(getQuest("q1")?.quest.goal).toBe("g"); });
  it("addFateCard 到不存在的 id 返回 false", () => { expect(addFateCard("nope", { type: "curse", title: "t", effect: "e", tone: "x", trigger: "next_round" })).toBe(false); });
  it("addFateCard 追加 + listFateCards", () => {
    createQuest("q2", quest);
    addFateCard("q2", { type: "object", title: "umbrella", effect: "e", tone: "x", trigger: "next_round" });
    expect(listFateCards("q2")).toHaveLength(1);
  });
});
```
- [ ] **Step 2:** `npm test tests/questStore.test.ts` → FAIL
- [ ] **Step 3: 写 `lib/questStore.ts`**
```ts
import type { Quest, FateCard } from "@/lib/schema";
type Entry = { quest: Quest; fateCards: FateCard[] };
const store = new Map<string, Entry>();
export function createQuest(id: string, quest: Quest): void { store.set(id, { quest, fateCards: [] }); }
export function getQuest(id: string): Entry | undefined { return store.get(id); }
export function addFateCard(id: string, card: FateCard): boolean {
  const e = store.get(id); if (!e) return false; e.fateCards.push(card); return true;
}
export function listFateCards(id: string): FateCard[] { return store.get(id)?.fateCards ?? []; }
```
- [ ] **Step 4:** `npm test tests/questStore.test.ts` → PASS
- [ ] **Step 5:** Commit: `feat: in-memory quest store`

---

## Phase 6 · API Routes

### Task 6: app/api/quest/route.ts
**Files:** Create `app/api/quest/route.ts`
- [ ] **Step 1: 写 route**
```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildQuestPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackQuest } from "@/lib/fallback";
import { QuestSchema } from "@/lib/schema";
import { createQuest } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, members, theme } = await req.json();
  const names: string[] = Array.isArray(members) ? members : [];
  let quest;
  if (isOffline()) quest = fallbackQuest(names);
  else {
    try { const { system, user } = buildQuestPrompt(names, theme); quest = QuestSchema.parse(await glmJSON(system, user)); }
    catch { quest = fallbackQuest(names); }
  }
  if (questId) createQuest(String(questId), quest);
  return Response.json(quest);
}
```
- [ ] **Step 2:** 联调（GLM_OFFLINE=true）：`curl -X POST .../api/quest -d '{"questId":"q1","members":["Xiaomin","Emma"],"theme":"The Unread Beast"}'` → 返回含 scene/players/goal 的 JSON。
- [ ] **Step 3:** Commit: `feat: /api/quest`

### Task 7: app/api/roll/route.ts
**Files:** Create `app/api/roll/route.ts`
- [ ] **Step 1: 写 route**
```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { clampD20, rollLabel } from "@/lib/dice";
import { buildRollPrompt } from "@/lib/director";
import { glmText } from "@/lib/glm";
import { fallbackRoundResult } from "@/lib/fallback";
import { getQuest, listFateCards } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, roll, recent } = await req.json();
  const n = clampD20(typeof roll === "number" ? roll : 1);
  const label = rollLabel(n);
  const entry = questId ? getQuest(String(questId)) : undefined;
  const fate = questId ? listFateCards(String(questId)) : [];
  const setup = entry?.quest.scene.setup ?? "";
  if (isOffline()) return Response.json({ roll: n, label, narration: fallbackRoundResult(n, fate).narration });
  try {
    const { system, user } = buildRollPrompt(setup, label, fate, recent ?? "");
    const narration = (await glmText(system, user)).trim();
    return Response.json({ roll: n, label, narration: narration || fallbackRoundResult(n, fate).narration });
  } catch {
    return Response.json({ roll: n, label, narration: fallbackRoundResult(n, fate).narration });
  }
}
```
- [ ] **Step 2:** 联调：`curl ... /api/roll -d '{"questId":"q1","roll":7,"recent":"开场"}'` → `{roll:7,label:"Messy Progress",narration:"..."}`。
- [ ] **Step 3:** Commit: `feat: /api/roll`

### Task 8: app/api/fate/route.ts
**Files:** Create `app/api/fate/route.ts`
- [ ] **Step 1: 写 route**
```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildFateCardPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackFateCard } from "@/lib/fallback";
import { FateCardSchema, FATE_TYPES } from "@/lib/schema";
import { addFateCard } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, type, input, friend } = await req.json();
  const safeType = (FATE_TYPES as readonly string[]).includes(type) ? type : "curse";
  let card;
  if (isOffline()) card = fallbackFateCard(String(input ?? ""), 0);
  else {
    try { const { system, user } = buildFateCardPrompt(safeType, String(input ?? "")); card = FateCardSchema.parse({ ...(await glmJSON(system, user) as object), type: safeType }); }
    catch { card = fallbackFateCard(String(input ?? ""), 0); }
  }
  card = { ...card, type: safeType, source_friend: friend ? String(friend) : undefined };
  if (questId) addFateCard(String(questId), card);
  return Response.json(card);
}
```
- [ ] **Step 2:** 联调：`curl ... /api/fate -d '{"questId":"q1","type":"curse","input":"everyone speaks in food metaphors","friend":"Maya"}'` → 合法 FateCard，且后续 /api/roll 能读到它。
- [ ] **Step 3:** Commit: `feat: /api/fate`

### Task 9: app/api/questcard/route.ts
**Files:** Create `app/api/questcard/route.ts`
- [ ] **Step 1: 写 route**
```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildQuestCardPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackQuestCard } from "@/lib/fallback";
import { QuestCardSchema } from "@/lib/schema";
import { listFateCards } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, finalRoll, summary } = await req.json();
  const n = typeof finalRoll === "number" ? finalRoll : 0;
  const titles = (questId ? listFateCards(String(questId)) : []).map((f) => f.title);
  const best = titles[titles.length - 1] ?? "—";
  if (isOffline()) return Response.json(fallbackQuestCard(n, best));
  try {
    const { system, user } = buildQuestCardPrompt(String(summary ?? ""), n, titles);
    return Response.json(QuestCardSchema.parse({ ...(await glmJSON(system, user) as object), final_roll: n }));
  } catch {
    return Response.json(fallbackQuestCard(n, best));
  }
}
```
- [ ] **Step 2:** 联调：`curl ... /api/questcard -d '{"questId":"q1","finalRoll":18,"summary":"打败野兽"}'` → 合法 QuestCard。
- [ ] **Step 3:** Commit: `feat: /api/questcard`

---

## Phase 7 · 数据 + 组件

### Task 10: data/quest.ts
**Files:** Create `data/quest.ts`
- [ ] **Step 1: 写**
```ts
export const QUEST_THEMES = ["The Unread Beast", "Flat Heist", "Last Train Home", "Group Chat Trial"] as const;
export type QuestTheme = (typeof QUEST_THEMES)[number];
export const FATE_TYPE_LABELS: { type: string; label: string; example: string }[] = [
  { type: "character", label: "加角色", example: "A jealous duck" },
  { type: "object", label: "加道具", example: "A broken umbrella" },
  { type: "curse", label: "加诅咒", example: "Everyone speaks in food metaphors" },
  { type: "rule", label: "加规则", example: "Doors only open after bad advice" },
  { type: "blessing", label: "加祝福", example: "One free escape" },
];
```
- [ ] **Step 2:** `npx tsc --noEmit` clean; Commit: `feat: quest themes + fate type catalog`

### Task 11: 组件 DiceRoller / RollResultBanner / FateCardList / QuestCard
**Files:** Create `components/DiceRoller.tsx`, `components/RollResultBanner.tsx`, `components/FateCardList.tsx`, `components/QuestCard.tsx`
- [ ] **Step 1: `components/DiceRoller.tsx`**
```tsx
"use client";
import { useState } from "react";
export function DiceRoller({ onRoll, disabled }: { onRoll: (n: number) => void; disabled?: boolean }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(20);
  function roll() {
    if (disabled || rolling) return;
    setRolling(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 20)); ticks++;
      if (ticks > 10) { clearInterval(iv); const final = 1 + Math.floor(Math.random() * 20); setFace(final); setRolling(false); onRoll(final); }
    }, 60);
  }
  return (
    <button onClick={roll} disabled={disabled || rolling}
      className="mx-auto my-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-indigo-700 text-3xl font-extrabold text-white shadow-lg disabled:opacity-50">
      {rolling ? "🎲" : face}
    </button>
  );
}
```
- [ ] **Step 2: `components/RollResultBanner.tsx`**
```tsx
const COLOR: Record<string, string> = {
  "Total Chaos": "bg-red-700", "Awkward Fail": "bg-orange-700", "Messy Progress": "bg-yellow-700",
  "Works Somehow": "bg-emerald-700", "Main Character Moment": "bg-fuchsia-700", "Iconic Roll": "bg-indigo-600",
};
export function RollResultBanner({ roll, label }: { roll: number; label: string }) {
  return (
    <div className={`mx-3 my-2 rounded-xl px-3 py-2 text-center text-white ${COLOR[label] ?? "bg-zinc-700"}`}>
      🎲 {roll} · <span className="font-bold">{label}</span>
    </div>
  );
}
```
- [ ] **Step 3: `components/FateCardList.tsx`**
```tsx
import type { FateCard } from "@/lib/schema";
export function FateCardList({ cards }: { cards: FateCard[] }) {
  if (!cards.length) return null;
  return (
    <div className="mx-3 my-2 space-y-1">
      {cards.map((c, i) => (
        <div key={i} className="rounded-lg border border-fuchsia-700/50 bg-fuchsia-950/30 px-3 py-1 text-sm">
          <span className="text-fuchsia-300">[{c.type}]</span> <b>{c.title}</b> — {c.effect}
          {c.source_friend && <span className="text-xs text-zinc-400"> · by {c.source_friend}</span>}
        </div>
      ))}
    </div>
  );
}
```
- [ ] **Step 4: `components/QuestCard.tsx`**（复用 cardExport 导出 PNG）
```tsx
"use client";
import { useRef } from "react";
import type { QuestCard as QC } from "@/lib/schema";
import { exportCardPng } from "@/lib/cardExport";
export function QuestCard({ card }: { card: QC }) {
  const ref = useRef<HTMLDivElement>(null);
  async function save() {
    if (!ref.current) return;
    const url = await exportCardPng(ref.current);
    const a = document.createElement("a"); a.href = url; a.download = "vibe-dice-quest.png"; a.click();
  }
  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="my-4 w-72 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-700 p-5 text-white shadow-xl">
        <div className="text-xs uppercase tracking-widest opacity-80">{card.title}</div>
        <div className="my-2 text-2xl font-extrabold">🎲 {card.final_roll} · {card.caption}</div>
        <div className="text-sm opacity-90">Best Interference: {card.best_interference}</div>
        <div className="mt-3 text-xs opacity-80">{card.cta}</div>
        <div className="mt-2 text-right text-[10px] opacity-70">Vibe Dice · Zymix</div>
      </div>
      <button onClick={save} className="rounded-full bg-white/90 px-4 py-2 font-semibold text-fuchsia-700">⬇️ 保存 Quest Card</button>
    </div>
  );
}
```
- [ ] **Step 5:** `npx tsc --noEmit` clean; Commit: `feat: dice/result/fate/questcard components`

---

## Phase 8 · 主游戏状态机

### Task 12: app/page.tsx
**Files:** Replace `app/page.tsx`
- [ ] **Step 1: 写 page**（cold → quest → 投骰×3 → questcard；含 share link 揭示）
```tsx
"use client";
import { useRef, useState } from "react";
import { PRESET_MEMBERS } from "@/data/members";
import { DEAD_GROUP } from "@/data/deadGroup";
import { QUEST_THEMES } from "@/data/quest";
import { MiniAppBar } from "@/components/MiniAppBar";
import { DeadGroup } from "@/components/DeadGroup";
import { MessageBubble, type ChatMsg } from "@/components/MessageBubble";
import { DiceRoller } from "@/components/DiceRoller";
import { RollResultBanner } from "@/components/RollResultBanner";
import { FateCardList } from "@/components/FateCardList";
import { QuestCard } from "@/components/QuestCard";
import type { Quest, FateCard, QuestCard as QC } from "@/lib/schema";

type Phase = "cold" | "loading" | "playing" | "ended";
const TOTAL_ROUNDS = 3;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("cold");
  const [quest, setQuest] = useState<Quest | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [round, setRound] = useState(0);
  const [last, setLast] = useState<{ roll: number; label: string } | null>(null);
  const [fate, setFate] = useState<FateCard[]>([]);
  const [card, setCard] = useState<QC | null>(null);
  const [showShare, setShowShare] = useState(false);
  const idRef = useRef(0);
  const questId = useRef<string>("");
  const recent = useRef<string>("");

  const nextId = () => `m${idRef.current++}`;
  const shareUrl = typeof window !== "undefined" && questId.current ? `${window.location.origin}/q/${questId.current}` : "";
  function push(author: string, text: string, kind: ChatMsg["kind"]) {
    setMsgs((m) => [...m, { id: nextId(), author, avatar: kind === "narration" ? "🎬" : "🎲", text, kind }]);
  }

  async function start(theme: string) {
    setPhase("loading"); setMsgs([]); setRound(0); setLast(null); setFate([]); setCard(null); setShowShare(false);
    questId.current = `q_${idRef.current++}_${theme.length}`;
    const res = await fetch("/api/quest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, members: PRESET_MEMBERS.map((m) => m.name), theme }) });
    const q: Quest = await res.json();
    setQuest(q); recent.current = q.scene.setup;
    push("旁白", q.scene.setup, "narration");
    setPhase("playing");
  }

  async function onRoll(n: number) {
    const res = await fetch("/api/roll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, roll: n, recent: recent.current }) });
    const r = await res.json();
    setLast({ roll: r.roll, label: r.label });
    push("旁白", r.narration, "narration");
    recent.current = r.narration;
    const next = round + 1; setRound(next);
    if (next === 1) setShowShare(true);
    if (next >= TOTAL_ROUNDS) await finish(r.roll);
  }

  async function refreshFate() {
    const res = await fetch("/api/roll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, roll: 11, recent: "(peek)" }) });
    await res.json(); // 触发服务端读取；fate 实际展示用下方 /api/fate 回填
  }

  async function finish(finalRoll: number) {
    const res = await fetch("/api/questcard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, finalRoll, summary: recent.current }) });
    setCard(await res.json()); setPhase("ended");
  }

  return (
    <main className="mx-auto flex h-screen max-w-md flex-col bg-zinc-950 text-zinc-100">
      <MiniAppBar />
      <div className="flex-1 overflow-y-auto">
        {phase === "cold" && (
          <div>
            <DeadGroup msgs={DEAD_GROUP} />
            <div className="p-4 text-center">
              <div className="mb-2 text-zinc-300">群里好冷？掷一颗骰子救场 👇</div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUEST_THEMES.map((t) => (
                  <button key={t} type="button" onClick={() => start(t)} className="rounded-full bg-zinc-800 px-4 py-2 hover:bg-fuchsia-700">{t}</button>
                ))}
                <button type="button" onClick={() => start("")} className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 font-semibold">🎲 Roll to revive</button>
              </div>
            </div>
          </div>
        )}
        {phase === "loading" && <div className="p-8 text-center text-zinc-400">AI 正在生成冒险…🎲</div>}
        {quest && phase !== "cold" && (
          <div className="grid grid-cols-2 gap-2 p-3">
            {quest.players.map((p) => (
              <div key={p.name} className="rounded-xl bg-gradient-to-br from-fuchsia-700 to-indigo-700 p-3 text-white">
                <div className="text-xs opacity-80">{p.name}</div><div className="font-bold">{p.role}</div><div className="text-xs opacity-90">{p.ability}</div>
              </div>
            ))}
          </div>
        )}
        <FateCardList cards={fate} />
        {msgs.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {last && phase === "playing" && <RollResultBanner roll={last.roll} label={last.label} />}
        {phase === "ended" && card && <QuestCard card={card} />}
      </div>
      {phase === "playing" && (
        <div className="border-t border-zinc-800">
          <div className="px-3 pt-2 text-center text-xs text-zinc-400">第 {round + 1}/{TOTAL_ROUNDS} 回合 · 点骰子推进</div>
          <DiceRoller onRoll={onRoll} />
          {showShare && shareUrl && (
            <div className="px-3 pb-3 text-center">
              <div className="text-xs text-fuchsia-300 mb-1">让 WhatsApp 好友干预故事：</div>
              <input readOnly value={shareUrl} className="w-full rounded bg-zinc-800 px-2 py-1 text-xs" onFocus={(e) => e.currentTarget.select()} />
              <a href={shareUrl} target="_blank" className="mt-1 inline-block text-xs underline text-fuchsia-400">打开干预页（演示用）</a>
            </div>
          )}
        </div>
      )}
      {phase === "ended" && <button type="button" onClick={() => setPhase("cold")} className="m-3 rounded-full bg-fuchsia-600 py-2 text-white">再来一局 🔁</button>}
    </main>
  );
}
```
> 注：好友提交的 Fate Card 存在服务端 store；本参考版主页面用 `/api/roll` 时服务端会读取并编入旁白。如需在主页面**实时展示** fate 列表，可加一个 `GET /api/fate?questId=` 拉取后 `setFate(...)`（增强项，见 Task 14）。
- [ ] **Step 2:** `npx tsc --noEmit` clean；`npm run build` 成功。
- [ ] **Step 3:** Commit: `feat: Vibe Dice quest state machine`

---

## Phase 9 · 外部好友干预页

### Task 13: app/q/[id]/page.tsx
**Files:** Create `app/q/[id]/page.tsx`
- [ ] **Step 1: 写**
```tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FATE_TYPE_LABELS } from "@/data/quest";

export default function InterferePage() {
  const params = useParams<{ id: string }>();
  const [type, setType] = useState("curse");
  const [input, setInput] = useState("");
  const [friend, setFriend] = useState("");
  const [done, setDone] = useState<null | { title: string; effect: string }>(null);

  async function submit() {
    if (!input.trim()) return;
    const res = await fetch("/api/fate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: params.id, type, input: input.trim(), friend: friend.trim() || undefined }) });
    const card = await res.json();
    setDone({ title: card.title, effect: card.effect });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-zinc-950 p-5 text-zinc-100">
      <h1 className="text-xl font-bold">😈 Help or ruin this quest</h1>
      <p className="mt-1 text-sm text-zinc-400">给朋友的冒险加一个转折。不用下载 App。</p>
      {!done ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {FATE_TYPE_LABELS.map((t) => (
              <button key={t.type} type="button" onClick={() => { setType(t.type); setInput(t.example); }}
                className={`rounded-full px-3 py-1 text-sm ${type === t.type ? "bg-fuchsia-600 text-white" : "bg-zinc-800"}`}>{t.label}</button>
            ))}
          </div>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="一句话，比如：A pigeon wearing sunglasses"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none" />
          <input value={friend} onChange={(e) => setFriend(e.target.value)} placeholder="你的名字（可选）"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none" />
          <button type="button" onClick={submit} className="w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 py-2 font-semibold text-white">提交干预 ✨</button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-fuchsia-950/40 p-4">
          <div className="text-fuchsia-300">已加入故事：</div>
          <div className="mt-1 text-lg font-bold">{done.title}</div>
          <div className="text-sm opacity-90">{done.effect}</div>
          <div className="mt-4 text-xs text-zinc-400">想开自己的冒险？<a className="underline" href="/">打开 Zymix · Vibe Dice</a></div>
        </div>
      )}
    </main>
  );
}
```
- [ ] **Step 2:** `npm run build` 成功（动态路由 `/q/[id]` 出现）。
- [ ] **Step 3:** 联调（GLM_OFFLINE=true）：开 `/q/test123` 选类型+输入+提交 → 显示生成的 Fate Card；同 questId 下主页面投骰能读到。
- [ ] **Step 4:** Commit: `feat: external friend Fate Card interference page`

---

## Phase 10 · 增强、兜底、收尾

### Task 14:（增强）GET /api/fate 拉取 + 主页面实时展示 fate
**Files:** Modify `app/api/fate/route.ts`(加 GET), `app/page.tsx`(轮询/按钮刷新 setFate)
- [ ] **Step 1:** 在 `app/api/fate/route.ts` 加：
```ts
import { listFateCards } from "@/lib/questStore";
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("questId") ?? "";
  return Response.json({ cards: listFateCards(id) });
}
```
- [ ] **Step 2:** `app/page.tsx`：在每次 `onRoll` 前 `const f = await (await fetch(\`/api/fate?questId=${questId.current}\`)).json(); setFate(f.cards);` 让最新好友干预在投骰前显示。
- [ ] **Step 3:** `npm run build` 成功；Commit: `feat: live fate card fetch in main game`

### Task 15: 全量验证 + Demo 数据
**Files:** —
- [ ] **Step 1:** `npm test` → 所有（dice/schema/fallback/director/questStore/env）通过。
- [ ] **Step 2:** `npm run build` 成功。
- [ ] **Step 3:** 离线手动走查：cold → 选主题 → 投骰×3（中途开 `/q/<id>` 提交一张 Fate Card）→ Quest Card → 保存 PNG。
- [ ] **Step 4:** Commit: `test: full Vibe Dice flow verified offline`

### Task 16: 收尾（Orbie + 提交）
- [ ] `capture my persona` → 补字段（主赛道 Vibe with Zymix）→ 队长打包传 orbit24.uk。
- [ ] Devpost 主提交 + Fotor/Manus 链接（见 DESIGN §14）。
- [ ] 所有链接无登录窗口可打开；12:00 前提交留 buffer。

---

## 自检（Self-Review）
- **Spec 覆盖**：骰子系统(§4)→Task1/11；Fate Card(§5,5.3 白名单)→schema FATE_TYPES + /api/fate 强制 type + 干预页 Task13；玩法循环(§3)→Task12；降级(§7：单人/Sleeping NPC/好友不下载/API失败)→fallbackQuest(空成员)/store/GLM_OFFLINE+兜底贯穿；Zymix 整合(§8)→MiniAppBar/DeadGroup/分享链接；技术(§9)→Phase1-10；专项奖(§11)→ORBIT-GLM-GUIDE + Fotor(QuestCard)+Task16；demo(§12)→DEMO-RUNBOOK；风险(§13)→白名单/3回合/schema/兜底/离线。✅
- **占位符**：无 TODO/TBD；每个 code step 给完整代码。✅
- **类型一致**：`Quest/Player/FateCard/RoundResult/QuestCard` 跨 schema/fallback/director/store/api/components/page 命名一致；`rollLabel` 返回值与 RollResultBanner 颜色表键一致；`questId`/`source_friend` 字段贯通。✅
- **已知局限（非占位）**：① 内存 store 仅单 dev 进程有效（demo 足够，生产需 KV/DB）；② Sleeping NPC「回来 re-enter」交互为设计项，MVP 由 fallbackQuest 的 status 字段预留、UI 未做（时间盒，不影响主闭环）；③ Fotor 真集成仍用 PNG 导出保底。
