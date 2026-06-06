# Z.ai × Orbit + GLM 操作手册（开赛照做）

> Vibe Roles · VibeHack London 2026。本文件把「拿 Z.ai×Orbit 奖」和「用 GLM」的全部操作固化在项目里，开赛直接照做。

## 一句话本质
Z.ai×Orbit 奖 = **真的用 Z.ai/GLM 做项目** + 全程让 **Orbie** 观察记录过程 → 结束生成 package → 传到 **orbit24.uk（不是 Devpost）**。评的是过程证据，不是结果。4 个维度各 £300，共 £1,200。

---

## 第一步 · 领 GLM API Key
- 领取地址：**https://zai-hackathon.zeabur.app/** 或 GLM/Z.AI Discord 群（置顶/专用频道）。
- 两个工具（Claude Code / Cursor）共用同一个 key。

## 第二步 · 把 Claude Code 接到 GLM（方式A：工作流用，拿 Best Workflow Use）
本项目已配好 **项目级** `.claude/settings.json`：
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "在这里填你的GLM_KEY",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "API_TIMEOUT_MS": "3000000"
  }
}
```
- 把 key 填进去 → 在本目录 `claude` 启动 → `/status` 确认在用 GLM（界面仍显示 Claude 模型名是**正常**的，服务端已映射）。
- 要求：Claude Code **v2.0.14+**、Node 18+、Git for Windows。
- 默认模型映射：Opus/Sonnet→**GLM-4.7**，Haiku→**GLM-4.5-Air**。
- 想用 **GLM-5.1**，在 `env` 里加：
  ```json
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5v-turbo",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  ```
  （GLM-5.1 是高级模型，14:00–18:00 UTC+8 高峰按更高倍率扣额度）

## 第三步 · 加载 Orbie（开局第一条消息）
```text
Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026.
Acknowledge once, then stay silent until I name you ("Orbie, ...") or use // @orbie in code or trigger capture. Log my code and cognitive layers in the background.
```

## 第四步 · 做项目时留痕（让证据扎实）
1. 每个决策在 prompt 里**口头说明为什么用 GLM**（"这里用 GLM 做中文意图解析，因为…"）→ 它当 D1/D2 证据。
2. **频繁 git commit**（Orbie 靠 commit 节奏判断工程习惯）。
3. 把 GLM 调用截图、模型对比、关键 prompt 丢进 `evidence/`。
4. 召唤反馈（不打断写码）：`Orbie, what have you noticed?` / `Orbie, am I drifting?` / 代码注释 `// @orbie check this`。

## 第五步 · 收尾捕获 + 打包
- 发 `capture my persona` → 答 3 问（persona名/语言/日常还是今天特定）→ 补必填项（队名、队员、主赛道填 **Vibe with Zymix**、项目名、做了什么、GitHub URL、Devpost URL、≥1 demo 链接）。
- 生成个人文件夹（SKILL.md / manifest.md / zai-orbit-evidence.md / stats.json / evidence/）。
- **队员**交给队长；**队长**汇总成 `team-<队名>/` + `team-manifest.md`，打包一个 zip，**上传 orbit24.uk**。

## 三个坑
1. 包传 **orbit24.uk**，不是 Devpost。
2. 必须真用 GLM 且留"为什么用"的话术，否则证据全是 "no evidence"。
3. **Build Naturally**：别为奖硬凹，认真做+真实记录即可。

---

# 方式B · 在 Vibe Roles App 里调 GLM API（拿 Best Product Integration）

> 让 GLM 成为产品的核心引擎（选角/旁白/名场面）。下面是 Next.js（App Router）参考代码。
> ⚠️ **endpoint 和模型名以活动资源包/Discord 为准**。Z.ai 的 OpenAI 兼容地址通常是 `https://api.z.ai/api/paas/v4`（产品调用）或 `https://api.z.ai/api/coding/paas/v4`（编码用）。模型名先用 `glm-4.6`，确认后替换。

### `.env.local`
```bash
GLM_API_KEY=你的GLM_KEY
GLM_BASE_URL=https://api.z.ai/api/paas/v4
GLM_MODEL=glm-4.6
```

### `lib/glm.ts` — GLM 客户端（OpenAI 兼容）
```ts
type Msg = { role: "system" | "user" | "assistant"; content: string };

const BASE = process.env.GLM_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const KEY = process.env.GLM_API_KEY!;
const MODEL = process.env.GLM_MODEL ?? "glm-4.6";

/** 非流式：用于「场景+选角」结构化生成 */
export async function glmJSON(messages: Msg[]): Promise<any> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.9,
      response_format: { type: "json_object" }, // 强约束输出 JSON
    }),
  });
  if (!res.ok) throw new Error(`GLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

/** 流式：用于旁白「实时打字」的戏剧感 */
export async function glmStream(messages: Msg[]) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.9, stream: true }),
  });
  return res.body!; // SSE 流，前端按 data: 逐块解析
}
```

### `app/api/scene/route.ts` — 一键选角（核心调用①）
```ts
import { glmJSON } from "@/lib/glm";

const SYSTEM = `你是 Vibe Roles 的导演。根据"主题"和"在场成员名单"，即兴现编一个30秒微剧场。
严格只输出 JSON，结构：
{
  "scene": {"theme": "...", "setup": "一句话场景设定"},
  "roles": [{"member": "成员名", "role": "角色名", "hook": "一句话任务/台词钩子"}],
  "opening_narration": "旁白开场白(<=40字)",
  "beats": [{"narration": "..."}],
  "ending": "反转结局(<=40字)"
}
规则：roles 数量 = 成员数；语气活泼适合 Gen Z；中文；不得越界生成不当内容。`;

export async function POST(req: Request) {
  const { members, theme } = await req.json(); // members: string[], theme: string
  try {
    const scene = await glmJSON([
      { role: "system", content: SYSTEM },
      { role: "user", content: `主题：${theme || "随机"}\n在场成员：${members.join("、")}` },
    ]);
    return Response.json(scene);
  } catch {
    // 兜底：返回预生成剧本，保证 demo 不翻车（见 lib/fallback.ts）
    const { fallbackScene } = await import("@/lib/fallback");
    return Response.json(fallbackScene(members, theme));
  }
}
```

### `app/api/narrate/route.ts` — 旁白接龙（核心调用②，流式）
```ts
import { glmStream } from "@/lib/glm";

export async function POST(req: Request) {
  const { scene, history } = await req.json(); // history: 成员这一轮发的话
  const stream = await glmStream([
    { role: "system", content: "你是旁白，把成员刚才的发言接龙进剧情，推进一段(<=50字)，留钩子让大家继续。中文，戏剧感，Gen Z 语气。" },
    { role: "user", content: `场景：${JSON.stringify(scene.scene)}\n成员发言：${history}` },
  ]);
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}
```

### 降级兜底 `lib/fallback.ts`（防翻车命脉）
```ts
export function fallbackScene(members: string[], theme: string) {
  const roles = ["主角", "反派", "神秘人", "旁观者"];
  return {
    scene: { theme: theme || "宿舍悬案", setup: "深夜宿舍，泡面不翼而飞。" },
    roles: members.map((m, i) => ({ member: m, role: roles[i % roles.length], hook: "说一句你的不在场证明" })),
    opening_narration: "案发现场只剩泡面汤……谁是真凶？",
    beats: [{ narration: "线索一：调料包还是热的。" }],
    ending: "真凶竟是——那只总在窗台的猫。",
  };
}
```

> 提示：选角/旁白都用 GLM（产品整合证据）+ 用 Claude Code 接 GLM 写这些代码（工作流证据）= 同时占住 Best Product Integration 和 Best Workflow Use 两个维度。
