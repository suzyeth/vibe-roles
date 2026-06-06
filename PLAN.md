# Vibe Roles 实现计划（Implementation Plan）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 24h 内做出一个单屏 Web 原型——模拟 Zymix 群聊，一键由 GLM 即兴生成 30 秒微剧场、给在场成员分角色、AI 旁白接龙、结束生成可分享「名场面卡」。

**Architecture:** Next.js 14 App Router 单页应用。所有可测试逻辑（schema 校验、兜底剧本、降级/选角、名场面挑选）放在 `lib/` 纯函数里做 TDD；GLM 调用封装在 `lib/glm.ts`，API route 只做"调 director + 调 GLM + 失败兜底"的薄编排。前端是一个游戏状态机（idle → 选角 → 逐回合演 → 结局+名场面卡）。**离线开关** `GLM_OFFLINE=true` 可强制走兜底，保证 demo 永不翻车。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Zod（schema 校验）, Vitest（单测）, GLM（OpenAI 兼容 API）, Fotor（名场面卡渲染）。

---

## 文件结构

```
VibeRoles/
  package.json, tsconfig.json, next.config.js, vitest.config.ts, .env.local
  data/
    members.ts        预置假 Zymix 成员
    themes.ts         主题白名单
  lib/
    schema.ts         Zod 类型 + Scene/Highlight 校验（纯）
    fallback.ts       兜底剧本/旁白/名场面（纯）
    director.ts       选角/降级/prompt 构建/名场面挑选（纯）
    glm.ts            GLM 客户端（glmJSON / glmText）
    env.ts            读取 GLM_OFFLINE 等开关（纯）
  app/
    layout.tsx, page.tsx, globals.css
    api/scene/route.ts      一键选角
    api/narrate/route.ts    旁白接龙
    api/highlight/route.ts  名场面挑选
  components/
    ChatWindow.tsx, MessageBubble.tsx, RoleCardList.tsx,
    Composer.tsx, ThemePicker.tsx, HighlightCard.tsx
  tests/
    schema.test.ts, fallback.test.ts, director.test.ts, env.test.ts
```

每个 `lib/` 文件单一职责、可独立测试。UI 组件按职责拆分，`page.tsx` 持有游戏状态机并编排组件与 API。

---

## Phase 0 · 项目脚手架

### Task 0: 初始化 Next.js + Tailwind + Vitest

**Files:**
- Create: 整个项目骨架、`vitest.config.ts`、`.env.local`、`.gitignore`

- [ ] **Step 1: 创建 Next.js 项目（在桌面 VibeRoles 内）**

Run（在 `C:\Users\ASUS\Desktop\VibeRoles` 内；若目录已有 DESIGN.md 等文件，create-next-app 需空目录——先在临时名创建再合并，或用 `.` 并保留现有 md）：
```bash
npx create-next-app@14 . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
```
若提示目录非空：先把 `DESIGN.md README.md ORBIT-GLM-GUIDE.md PLAN.md .claude` 暂移出，建完再移回。

- [ ] **Step 2: 安装依赖**

Run:
```bash
npm install zod
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 3: 写 `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": new URL(".", import.meta.url).pathname } },
});
```

- [ ] **Step 4: 在 `package.json` 的 scripts 加 test**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: 写 `.env.local`（并确保被 .gitignore）**

```bash
GLM_API_KEY=在这里填你的GLM_KEY
GLM_BASE_URL=https://api.z.ai/api/paas/v4
GLM_MODEL=glm-4.6
GLM_OFFLINE=false
FOTOR_API_KEY=
```
> ⚠️ endpoint/模型名以活动资源包/Discord 为准（见 ORBIT-GLM-GUIDE.md）。`.env.local` 默认已在 Next 的 .gitignore 中。

- [ ] **Step 6: 提交**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js + Tailwind + Vitest"
```

---

## Phase 1 · 类型与 Schema（TDD）

### Task 1: Zod schema 与类型

**Files:**
- Create: `lib/schema.ts`
- Test: `tests/schema.test.ts`

- [ ] **Step 1: 写失败测试 `tests/schema.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { SceneSchema, HighlightSchema } from "@/lib/schema";

const validScene = {
  scene: { theme: "宿舍悬案", setup: "深夜宿舍，泡面失踪" },
  roles: [{ member: "Alex", role: "侦探", hook: "找出真凶" }],
  opening_narration: "案发现场只剩泡面汤",
  beats: [{ narration: "线索一：调料包还热着" }],
  ending: "真凶竟是那只猫",
};

describe("SceneSchema", () => {
  it("接受合法 scene", () => {
    expect(SceneSchema.parse(validScene)).toBeTruthy();
  });
  it("拒绝 roles 为空", () => {
    expect(() => SceneSchema.parse({ ...validScene, roles: [] })).toThrow();
  });
  it("拒绝缺字段", () => {
    expect(() => SceneSchema.parse({ scene: {} })).toThrow();
  });
});

describe("HighlightSchema", () => {
  it("接受合法 highlight", () => {
    expect(HighlightSchema.parse({ member: "Alex", line: "是猫干的", card_caption: "真凶现形" })).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`
Expected: FAIL（找不到 `@/lib/schema`）

- [ ] **Step 3: 写 `lib/schema.ts`**

```ts
import { z } from "zod";

export const RoleSchema = z.object({
  member: z.string().min(1),
  role: z.string().min(1),
  hook: z.string().min(1),
});

export const BeatSchema = z.object({ narration: z.string().min(1) });

export const SceneSchema = z.object({
  scene: z.object({ theme: z.string().min(1), setup: z.string().min(1) }),
  roles: z.array(RoleSchema).min(1),
  opening_narration: z.string().min(1),
  beats: z.array(BeatSchema),
  ending: z.string().min(1),
});
export type Scene = z.infer<typeof SceneSchema>;
export type Role = z.infer<typeof RoleSchema>;

export const HighlightSchema = z.object({
  member: z.string().min(1),
  line: z.string().min(1),
  card_caption: z.string().min(1),
});
export type Highlight = z.infer<typeof HighlightSchema>;
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test`
Expected: PASS（schema 3+1 测试全过）

- [ ] **Step 5: 提交**

```bash
git add lib/schema.ts tests/schema.test.ts && git commit -m "feat: Scene/Highlight Zod schemas with tests"
```

---

## Phase 2 · 纯逻辑：env / director / fallback（TDD）

### Task 2: 环境开关 `lib/env.ts`

**Files:**
- Create: `lib/env.ts`
- Test: `tests/env.test.ts`

- [ ] **Step 1: 写失败测试 `tests/env.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { isOffline } from "@/lib/env";

describe("isOffline", () => {
  beforeEach(() => { delete process.env.GLM_OFFLINE; });
  it("默认 false", () => { expect(isOffline()).toBe(false); });
  it("GLM_OFFLINE=true 时 true", () => {
    process.env.GLM_OFFLINE = "true";
    expect(isOffline()).toBe(true);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test tests/env.test.ts`
Expected: FAIL（找不到 `@/lib/env`）

- [ ] **Step 3: 写 `lib/env.ts`**

```ts
export function isOffline(): boolean {
  return process.env.GLM_OFFLINE === "true";
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test tests/env.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/env.ts tests/env.test.ts && git commit -m "feat: GLM_OFFLINE switch"
```

### Task 3: 兜底剧本 `lib/fallback.ts`

**Files:**
- Create: `lib/fallback.ts`
- Test: `tests/fallback.test.ts`

- [ ] **Step 1: 写失败测试 `tests/fallback.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { fallbackScene, fallbackNarration, fallbackHighlight } from "@/lib/fallback";
import { SceneSchema, HighlightSchema } from "@/lib/schema";

describe("fallbackScene", () => {
  it("产出的 scene 通过 SceneSchema", () => {
    const s = fallbackScene(["A", "B", "C"], "宿舍悬案");
    expect(SceneSchema.parse(s)).toBeTruthy();
  });
  it("roles 数量 = 成员数", () => {
    expect(fallbackScene(["A", "B"], "x").roles).toHaveLength(2);
  });
});

describe("fallbackNarration", () => {
  it("返回非空字符串", () => {
    expect(fallbackNarration("随便说的").length).toBeGreaterThan(0);
  });
});

describe("fallbackHighlight", () => {
  it("挑最长发言，且通过 HighlightSchema", () => {
    const h = fallbackHighlight([{ member: "A", text: "短" }, { member: "B", text: "这是更长的一句话" }]);
    expect(h.member).toBe("B");
    expect(HighlightSchema.parse(h)).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test tests/fallback.test.ts`
Expected: FAIL（找不到 `@/lib/fallback`）

- [ ] **Step 3: 写 `lib/fallback.ts`**

```ts
import type { Scene, Highlight } from "@/lib/schema";

const FALLBACK_ROLES = ["主角", "反派", "神秘人", "旁观者"];

export function fallbackScene(members: string[], theme: string): Scene {
  return {
    scene: { theme: theme || "宿舍悬案", setup: "深夜宿舍，最后一桶泡面不翼而飞。" },
    roles: members.map((m, i) => ({
      member: m,
      role: FALLBACK_ROLES[i % FALLBACK_ROLES.length],
      hook: "说一句你的不在场证明",
    })),
    opening_narration: "案发现场只剩半碗泡面汤……谁是真凶？",
    beats: [{ narration: "线索一：调料包居然还是热的。" }],
    ending: "真凶竟是——那只总蹲窗台的橘猫。",
  };
}

export function fallbackNarration(_history: string): string {
  return "剧情急转直下，所有人都把目光投向了门口……";
}

export function fallbackHighlight(transcript: { member: string; text: string }[]): Highlight {
  const best = transcript.reduce(
    (a, b) => (b.text.length > a.text.length ? b : a),
    transcript[0] ?? { member: "AI", text: "全场陷入沉默" },
  );
  return { member: best.member, line: best.text, card_caption: "本局名场面 · Vibe Roles" };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test tests/fallback.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/fallback.ts tests/fallback.test.ts && git commit -m "feat: fallback scene/narration/highlight"
```

### Task 4: 选角/降级/prompt `lib/director.ts`

**Files:**
- Create: `lib/director.ts`
- Test: `tests/director.test.ts`

- [ ] **Step 1: 写失败测试 `tests/director.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { padWithNPCs, buildScenePrompt, buildNarratePrompt } from "@/lib/director";

describe("padWithNPCs", () => {
  it("少于3人时补 NPC 到3", () => {
    expect(padWithNPCs(["A"])).toEqual(["A", "AI·路人甲", "AI·路人乙"]);
  });
  it("3人及以上不变", () => {
    expect(padWithNPCs(["A", "B", "C"])).toEqual(["A", "B", "C"]);
  });
});

describe("buildScenePrompt", () => {
  it("user 文本包含主题和成员", () => {
    const { system, user } = buildScenePrompt(["A", "B"], "飞船危机");
    expect(system).toContain("JSON");
    expect(user).toContain("飞船危机");
    expect(user).toContain("A");
  });
});

describe("buildNarratePrompt", () => {
  it("包含成员发言", () => {
    const { user } = buildNarratePrompt("救命剧情", "A说了句话");
    expect(user).toContain("A说了句话");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test tests/director.test.ts`
Expected: FAIL（找不到 `@/lib/director`）

- [ ] **Step 3: 写 `lib/director.ts`**

```ts
const NPC_NAMES = ["AI·路人甲", "AI·路人乙", "AI·路人丙"];

/** 在场不足3人时，用 NPC 补位到3（降级模式核心） */
export function padWithNPCs(members: string[]): string[] {
  const out = [...members];
  let i = 0;
  while (out.length < 3 && i < NPC_NAMES.length) out.push(NPC_NAMES[i++]);
  return out;
}

export function buildScenePrompt(members: string[], theme: string) {
  const system = `你是 Vibe Roles 的导演。根据"主题"和"在场成员名单"，即兴现编一个30秒微剧场。
严格只输出 JSON（不要 markdown 代码块），结构：
{"scene":{"theme":"...","setup":"一句话场景设定"},
 "roles":[{"member":"成员名","role":"角色名","hook":"一句话任务/台词钩子"}],
 "opening_narration":"旁白开场(<=40字)",
 "beats":[{"narration":"..."}],
 "ending":"反转结局(<=40字)"}
规则：roles 数量必须等于成员数；每个成员都要出现；中文；Gen Z 活泼语气；不得生成暴力/露骨/歧视等不当内容。`;
  const user = `主题：${theme || "随机"}\n在场成员：${members.join("、")}`;
  return { system, user };
}

export function buildNarratePrompt(sceneSetup: string, membersSaid: string) {
  const system = `你是旁白。把成员刚才的发言接龙进剧情，推进一段(<=50字)，结尾留钩子让大家继续。中文，戏剧感，Gen Z 语气。只输出旁白文本本身。`;
  const user = `场景：${sceneSetup}\n成员刚才的发言：${membersSaid}`;
  return { system, user };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test tests/director.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/director.ts tests/director.test.ts && git commit -m "feat: director — NPC padding + prompt builders"
```

---

## Phase 3 · GLM 客户端

### Task 5: `lib/glm.ts`

**Files:**
- Create: `lib/glm.ts`

> 说明：GLM 客户端做真实网络请求，不写单测（避免真调 API）；其正确性靠 Phase 4 的 API route 联调验证。逻辑保持极薄。

- [ ] **Step 1: 写 `lib/glm.ts`**

```ts
type Msg = { role: "system" | "user" | "assistant"; content: string };

const BASE = process.env.GLM_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const KEY = process.env.GLM_API_KEY ?? "";
const MODEL = process.env.GLM_MODEL ?? "glm-4.6";

async function call(messages: Msg[], jsonMode: boolean): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.9,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`GLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** 结构化生成：返回解析后的对象（解析失败由调用方兜底） */
export async function glmJSON(system: string, user: string): Promise<unknown> {
  const raw = await call([{ role: "system", content: system }, { role: "user", content: user }], true);
  return JSON.parse(raw);
}

/** 纯文本生成：用于旁白 */
export async function glmText(system: string, user: string): Promise<string> {
  return call([{ role: "system", content: system }, { role: "user", content: user }], false);
}
```

- [ ] **Step 2: 类型检查通过**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add lib/glm.ts && git commit -m "feat: thin GLM client (glmJSON/glmText)"
```

---

## Phase 4 · API Routes（薄编排 + 兜底）

### Task 6: `app/api/scene/route.ts`

**Files:**
- Create: `app/api/scene/route.ts`

- [ ] **Step 1: 写 route**

```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { padWithNPCs, buildScenePrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackScene } from "@/lib/fallback";
import { SceneSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { members, theme } = await req.json();
  const actors: string[] = padWithNPCs(Array.isArray(members) ? members : []);
  if (isOffline()) return Response.json(fallbackScene(actors, theme));
  try {
    const { system, user } = buildScenePrompt(actors, theme);
    const scene = SceneSchema.parse(await glmJSON(system, user)); // 校验失败即兜底
    return Response.json(scene);
  } catch {
    return Response.json(fallbackScene(actors, theme));
  }
}
```

- [ ] **Step 2: 联调验证（需先填好 GLM key，或设 GLM_OFFLINE=true）**

Run: `npm run dev`，另开终端：
```bash
curl -s -X POST http://localhost:3000/api/scene -H "Content-Type: application/json" -d "{\"members\":[\"Alex\",\"Sam\"],\"theme\":\"飞船危机\"}"
```
Expected: 返回含 `scene/roles/opening_narration/ending` 的 JSON；roles 含 Alex 和 Sam（不足3人时含 NPC）。

- [ ] **Step 3: 提交**

```bash
git add app/api/scene/route.ts && git commit -m "feat: /api/scene with schema-validated GLM + fallback"
```

### Task 7: `app/api/narrate/route.ts`

**Files:**
- Create: `app/api/narrate/route.ts`

- [ ] **Step 1: 写 route**

```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildNarratePrompt } from "@/lib/director";
import { glmText } from "@/lib/glm";
import { fallbackNarration } from "@/lib/fallback";

export async function POST(req: NextRequest) {
  const { sceneSetup, membersSaid } = await req.json();
  if (isOffline()) return Response.json({ narration: fallbackNarration(membersSaid) });
  try {
    const { system, user } = buildNarratePrompt(sceneSetup ?? "", membersSaid ?? "");
    const narration = (await glmText(system, user)).trim();
    return Response.json({ narration: narration || fallbackNarration(membersSaid) });
  } catch {
    return Response.json({ narration: fallbackNarration(membersSaid) });
  }
}
```

- [ ] **Step 2: 联调验证**

Run:
```bash
curl -s -X POST http://localhost:3000/api/narrate -H "Content-Type: application/json" -d "{\"sceneSetup\":\"飞船失火\",\"membersSaid\":\"Alex：是我按错了按钮\"}"
```
Expected: 返回 `{"narration":"..."}` 非空。

- [ ] **Step 3: 提交**

```bash
git add app/api/narrate/route.ts && git commit -m "feat: /api/narrate with fallback"
```

### Task 8: `app/api/highlight/route.ts`

**Files:**
- Create: `app/api/highlight/route.ts`

- [ ] **Step 1: 写 route**

```ts
import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { glmJSON } from "@/lib/glm";
import { fallbackHighlight } from "@/lib/fallback";
import { HighlightSchema } from "@/lib/schema";

const SYSTEM = `你是评审。从对话记录里挑出最好笑/最有梗的一句，只输出 JSON：
{"member":"发言人","line":"原话","card_caption":"给这句配一个<=12字的卡片标题"}`;

export async function POST(req: NextRequest) {
  const { transcript } = await req.json(); // [{member,text}]
  const list = Array.isArray(transcript) ? transcript : [];
  if (isOffline()) return Response.json(fallbackHighlight(list));
  try {
    const user = list.map((t: any) => `${t.member}：${t.text}`).join("\n");
    const h = HighlightSchema.parse(await glmJSON(SYSTEM, user));
    return Response.json(h);
  } catch {
    return Response.json(fallbackHighlight(list));
  }
}
```

- [ ] **Step 2: 联调验证**

Run:
```bash
curl -s -X POST http://localhost:3000/api/highlight -H "Content-Type: application/json" -d "{\"transcript\":[{\"member\":\"Alex\",\"text\":\"是猫干的\"},{\"member\":\"Sam\",\"text\":\"我看见它舔了泡面\"}]}"
```
Expected: 返回含 `member/line/card_caption` 的 JSON。

- [ ] **Step 3: 提交**

```bash
git add app/api/highlight/route.ts && git commit -m "feat: /api/highlight with fallback"
```

---

## Phase 5 · 数据与 UI 组件

### Task 9: 预置数据

**Files:**
- Create: `data/members.ts`, `data/themes.ts`

- [ ] **Step 1: 写 `data/members.ts`**

```ts
export type Member = { id: string; name: string; avatar: string; isAI: boolean };

/** 预置假 Zymix 成员；最后一个是"评委可输入"的真人位 */
export const PRESET_MEMBERS: Member[] = [
  { id: "m1", name: "小鹿", avatar: "🦌", isAI: true },
  { id: "m2", name: "阿K", avatar: "🧢", isAI: true },
  { id: "m3", name: "Momo", avatar: "🐱", isAI: true },
  { id: "you", name: "你", avatar: "🫵", isAI: false },
];
```

- [ ] **Step 2: 写 `data/themes.ts`**

```ts
export const THEMES = ["宿舍悬案", "综艺现场", "飞船危机", "八卦法庭"] as const;
export type Theme = (typeof THEMES)[number];
```

- [ ] **Step 3: 提交**

```bash
git add data/ && git commit -m "feat: preset members and themes"
```

### Task 10: 展示组件（MessageBubble / RoleCardList / HighlightCard / Composer / ThemePicker）

**Files:**
- Create: `components/MessageBubble.tsx`, `components/RoleCardList.tsx`, `components/HighlightCard.tsx`, `components/Composer.tsx`, `components/ThemePicker.tsx`

- [ ] **Step 1: 写 `components/MessageBubble.tsx`**

```tsx
export type ChatMsg = { id: string; author: string; avatar: string; text: string; kind: "narration" | "member" };

export function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isNarration = msg.kind === "narration";
  return (
    <div className={`flex gap-2 my-2 ${isNarration ? "justify-center" : ""}`}>
      {!isNarration && <span className="text-xl">{msg.avatar}</span>}
      <div className={isNarration
        ? "text-sm italic text-purple-300 bg-purple-950/40 px-3 py-1 rounded-full"
        : "bg-zinc-800 text-zinc-100 px-3 py-2 rounded-2xl max-w-[75%]"}>
        {!isNarration && <div className="text-xs text-zinc-400">{msg.author}</div>}
        {msg.text}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 `components/RoleCardList.tsx`**

```tsx
import type { Role } from "@/lib/schema";

export function RoleCardList({ roles }: { roles: Role[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {roles.map((r) => (
        <div key={r.member} className="bg-gradient-to-br from-fuchsia-700 to-indigo-700 rounded-xl p-3 text-white">
          <div className="text-xs opacity-80">{r.member}</div>
          <div className="text-lg font-bold">{r.role}</div>
          <div className="text-xs mt-1 opacity-90">{r.hook}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 写 `components/HighlightCard.tsx`（名场面卡）**

```tsx
import type { Highlight } from "@/lib/schema";

export function HighlightCard({ h }: { h: Highlight }) {
  return (
    <div className="mx-auto my-4 w-72 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-700 p-5 text-white shadow-xl">
      <div className="text-xs uppercase tracking-widest opacity-80">{h.card_caption}</div>
      <div className="my-3 text-2xl font-extrabold leading-snug">“{h.line}”</div>
      <div className="text-sm opacity-90">— {h.member}</div>
      <div className="mt-4 text-right text-[10px] opacity-70">Vibe Roles · Zymix</div>
    </div>
  );
}
```

- [ ] **Step 4: 写 `components/Composer.tsx`（真人位输入）**

```tsx
"use client";
import { useState } from "react";

export function Composer({ onSend, disabled }: { onSend: (t: string) => void; disabled?: boolean }) {
  const [v, setV] = useState("");
  return (
    <form
      className="flex gap-2 p-3 border-t border-zinc-800"
      onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onSend(v.trim()); setV(""); } }}
    >
      <input
        className="flex-1 rounded-full bg-zinc-800 px-4 py-2 text-zinc-100 outline-none disabled:opacity-50"
        placeholder="照你的角色冒一句…" value={v} disabled={disabled}
        onChange={(e) => setV(e.target.value)}
      />
      <button className="rounded-full bg-fuchsia-600 px-4 py-2 text-white disabled:opacity-50" disabled={disabled}>发送</button>
    </form>
  );
}
```

- [ ] **Step 5: 写 `components/ThemePicker.tsx`**

```tsx
"use client";
import { THEMES } from "@/data/themes";

export function ThemePicker({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="p-4 text-center">
      <div className="mb-3 text-zinc-300">群里有点冷？一键开一局 👇</div>
      <div className="flex flex-wrap justify-center gap-2">
        {THEMES.map((t) => (
          <button key={t} onClick={() => onPick(t)}
            className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-100 hover:bg-fuchsia-700">{t}</button>
        ))}
        <button onClick={() => onPick("")} className="rounded-full bg-fuchsia-600 px-4 py-2 text-white">🎲 随机</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 类型检查 + 提交**

Run: `npx tsc --noEmit`（应无错误）
```bash
git add components/ && git commit -m "feat: presentational components"
```

---

## Phase 6 · 游戏状态机（page.tsx）

### Task 11: 主页面编排

**Files:**
- Create/Modify: `app/page.tsx`

- [ ] **Step 1: 写 `app/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { PRESET_MEMBERS } from "@/data/members";
import { ThemePicker } from "@/components/ThemePicker";
import { RoleCardList } from "@/components/RoleCardList";
import { MessageBubble, type ChatMsg } from "@/components/MessageBubble";
import { Composer } from "@/components/Composer";
import { HighlightCard } from "@/components/HighlightCard";
import type { Scene, Highlight } from "@/lib/schema";

type Phase = "idle" | "loading" | "playing" | "ended";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scene, setScene] = useState<Scene | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [transcript, setTranscript] = useState<{ member: string; text: string }[]>([]);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const memberNames = PRESET_MEMBERS.map((m) => m.name);

  async function start(theme: string) {
    setPhase("loading"); setMsgs([]); setTranscript([]); setHighlight(null);
    const res = await fetch("/api/scene", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: memberNames, theme }),
    });
    const s: Scene = await res.json();
    setScene(s);
    setMsgs([{ id: "open", author: "旁白", avatar: "🎬", text: s.opening_narration, kind: "narration" }]);
    setPhase("playing");
  }

  async function onSend(text: string) {
    const next = [...transcript, { member: "你", text }];
    setTranscript(next);
    setMsgs((m) => [...m, { id: `u${m.length}`, author: "你", avatar: "🫵", text, kind: "member" }]);
    // 旁白接龙
    const res = await fetch("/api/narrate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneSetup: scene?.scene.setup, membersSaid: `你：${text}` }),
    });
    const { narration } = await res.json();
    setMsgs((m) => [...m, { id: `n${m.length}`, author: "旁白", avatar: "🎬", text: narration, kind: "narration" }]);
  }

  async function finish() {
    const res = await fetch("/api/highlight", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    setHighlight(await res.json());
    setPhase("ended");
  }

  return (
    <main className="mx-auto flex h-screen max-w-md flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 p-3 text-center font-bold">Zymix 群 · Vibe Roles</header>
      <div className="flex-1 overflow-y-auto">
        {phase === "idle" && <ThemePicker onPick={start} />}
        {phase === "loading" && <div className="p-8 text-center text-zinc-400">AI 正在选角…🎭</div>}
        {scene && phase !== "idle" && <RoleCardList roles={scene.roles} />}
        {msgs.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {phase === "ended" && highlight && <HighlightCard h={highlight} />}
      </div>
      {phase === "playing" && (
        <>
          <Composer onSend={onSend} />
          <button onClick={finish} className="m-3 rounded-full bg-indigo-600 py-2 text-white">收尾 → 出名场面卡</button>
        </>
      )}
      {phase === "ended" && (
        <button onClick={() => setPhase("idle")} className="m-3 rounded-full bg-fuchsia-600 py-2 text-white">再来一局 🔁</button>
      )}
    </main>
  );
}
```

- [ ] **Step 2: 跑起来人工验证（或用 browse 技能）**

Run: `npm run dev`，打开 http://localhost:3000
验证流程：选主题 → 看到角色卡 + 开场旁白 → 输入一句 → 出现旁白接龙 → 点"收尾" → 出名场面卡 → "再来一局"回到首页。
> 建议先设 `GLM_OFFLINE=true` 跑通整条 UI 流程（用兜底数据），再填 key 测真 GLM。

- [ ] **Step 3: 提交**

```bash
git add app/page.tsx && git commit -m "feat: game state machine wiring"
```

---

## Phase 7 · 名场面卡导出（Fotor）+ 分享

### Task 12: 卡片导出为图片

**Files:**
- Create: `lib/cardExport.ts`
- Modify: `components/HighlightCard.tsx`（加导出按钮）

> 策略：**优先**用 Fotor API/模板渲染（拿 Fotor 奖证据）；若 24h 内 Fotor 集成受阻，**降级用 `html-to-image` 把卡片 DOM 截成 PNG**，保证"可分享"功能一定可用。先做降级方案保底，Fotor 作为增强。

- [ ] **Step 1: 安装降级依赖**

Run: `npm install html-to-image`

- [ ] **Step 2: 写 `lib/cardExport.ts`**

```ts
import { toPng } from "html-to-image";

/** 把卡片 DOM 导出为 PNG dataURL（Fotor 不可用时的保底分享路径） */
export async function exportCardPng(el: HTMLElement): Promise<string> {
  return toPng(el, { pixelRatio: 2, cacheBust: true });
}
```

- [ ] **Step 3: 在 `HighlightCard.tsx` 加导出按钮**

在 `HighlightCard` 组件最外层 div 加 `ref`，并在下方加按钮：
```tsx
"use client";
import { useRef } from "react";
import type { Highlight } from "@/lib/schema";
import { exportCardPng } from "@/lib/cardExport";

export function HighlightCard({ h }: { h: Highlight }) {
  const ref = useRef<HTMLDivElement>(null);
  async function save() {
    if (!ref.current) return;
    const url = await exportCardPng(ref.current);
    const a = document.createElement("a");
    a.href = url; a.download = "vibe-roles-card.png"; a.click();
  }
  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="my-4 w-72 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-700 p-5 text-white shadow-xl">
        <div className="text-xs uppercase tracking-widest opacity-80">{h.card_caption}</div>
        <div className="my-3 text-2xl font-extrabold leading-snug">“{h.line}”</div>
        <div className="text-sm opacity-90">— {h.member}</div>
        <div className="mt-4 text-right text-[10px] opacity-70">Vibe Roles · Zymix</div>
      </div>
      <button onClick={save} className="rounded-full bg-white/90 px-4 py-2 text-fuchsia-700 font-semibold">⬇️ 保存卡片去分享</button>
    </div>
  );
}
```

- [ ] **Step 4: 验证 + 提交**

Run: `npm run dev` → 走到名场面卡 → 点"保存卡片" → 应下载 PNG。
```bash
git add lib/cardExport.ts components/HighlightCard.tsx package.json && git commit -m "feat: export highlight card as PNG (Fotor fallback)"
```

- [ ] **Step 5: （增强，时间允许再做）Fotor 集成**

按 `ORBIT-GLM-GUIDE.md` 里 Fotor 指南文档接 Fotor API/模板：把 `h.line`/`h.card_caption` 传入 Fotor 模板生成更精美的卡，替换或并列 PNG 导出。**这是 Fotor 营销奖的核心证据**——务必保留生成链接/截图到 `evidence/`。

---

## Phase 8 · 降级模式收尾 + 潜水代演

### Task 13: 单人/NPC 模式与潜水自动代演

**Files:**
- Modify: `app/page.tsx`

> `padWithNPCs` 已在后端保证"角色数≥3"。本任务补前端：当真人不发言（潜水）时，提供"AI 替我演"按钮，让 NPC/AI 角色自动产生一句，保证流程不卡。

- [ ] **Step 1: 在 `app/page.tsx` 的 playing 阶段加"AI 替演"按钮**

在 `<Composer>` 上方加：
```tsx
<button
  onClick={() => onSend("(我潜水，AI 替我演)")}
  className="mx-3 mt-2 rounded-full border border-zinc-700 py-1 text-sm text-zinc-300"
>😶 我潜水，让 AI 替我接一句</button>
```
（`onSend` 会照常触发旁白接龙，相当于 AI 推进剧情，消除"被迫表演"压力。）

- [ ] **Step 2: 验证 + 提交**

Run: `npm run dev` → playing 阶段点"AI 替我接一句" → 应出现旁白推进。
```bash
git add app/page.tsx && git commit -m "feat: lurker-friendly AI auto-advance"
```

---

## Phase 9 · Demo 防翻车 + 提交物

### Task 14: 离线 demo 模式 + 录屏脚本核对

**Files:**
- Modify: `.env.local`（demo 时切 GLM_OFFLINE）
- Create: `DEMO-RUNBOOK.md`

- [ ] **Step 1: 写 `DEMO-RUNBOOK.md`**

```markdown
# Demo 跑场手册（3 分钟）
- 网络好：GLM_OFFLINE=false，真 GLM 现场生成（有惊艳感）。
- 网络差/风险高：改 .env.local 设 GLM_OFFLINE=true，全程走兜底剧本，零翻车。
- 终极保底：播放预录的完美一局录屏。

## 节奏
0:00-0:25 甩死群截图 + "没人想当第一个发言的人" + 区隔话术（不是又一个陪聊 AI）
0:25-0:50 一键 → AI 选角（高光）
0:50-2:15 输入 1-2 句（队友配合）→ 旁白接龙 → 点收尾 → 名场面卡弹出 → 保存分享
2:15-2:40 GLM 即兴现编 + Claude Code 接 GLM 构建 + Orbie 捕获 + Fotor 出卡 + Manus 跑调研
2:40-3:00 解决 Zymix 冷启动（引用 61 下载/低活跃）+ 原生 Mini Game + 病毒卡飞轮 + 下一步

## 开演前检查
- [ ] GLM key 已填 / 或 GLM_OFFLINE=true
- [ ] 预录录屏已就绪
- [ ] npm run dev 已起、页面已打开、已预热一局
```

- [ ] **Step 2: 全量测试通过**

Run: `npm test`
Expected: 所有单测 PASS。

- [ ] **Step 3: 提交**

```bash
git add DEMO-RUNBOOK.md && git commit -m "docs: demo runbook + offline fallback"
```

### Task 15: 收尾 — Orbie 捕获 + 提交清单

- [ ] **Step 1:** 在 Claude Code 里 `capture my persona`，按提示补齐字段（主赛道填 Vibe with Zymix）。
- [ ] **Step 2:** 队长打包 `team-<队名>/` zip，上传 **orbit24.uk**。
- [ ] **Step 3:** Devpost 主提交 + 加 Fotor 链接 + Manus 链接（见 DESIGN.md §11 清单）。
- [ ] **Step 4:** 所有链接在无登录浏览器窗口验证可打开；12:00 前提交并留 buffer。

---

## 自检（Self-Review）

- **Spec 覆盖**：DESIGN.md 的玩法循环(§3)→Task6-11；降级模式(§4)→Task4/13；Zymix 整合(§5)→数据/UI 体现群聊+卡；技术方案(§6)→Phase0-7；专项奖(§8)→ORBIT-GLM-GUIDE + Task12(Fotor) + Task15；demo 脚本(§9)→Task14；风险表(§10)→GLM_OFFLINE/兜底/schema 校验贯穿全程。✅
- **占位符**：无 TODO/TBD；每个 code step 均给完整代码。✅
- **类型一致**：`Scene/Role/Highlight`(schema.ts) 在 fallback/director/routes/components 中签名一致；`ChatMsg` 在 MessageBubble 定义并被 page 复用。✅
- **已知留白（非占位，时间盒）**：Fotor 真集成(Task12 Step5)与多回合 beats 全自动推进为"时间允许再增强"项，已用 PNG 导出与单回合手动推进保底，不影响可运行闭环。
