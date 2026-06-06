# Z.ai × Orbit + GLM Operations Guide (follow on event day)

> Vibe Dice · VibeHack London 2026. This file pins down how to win the Z.ai×Orbit award and how to wire GLM, so the team can just follow it on the day.

## In one line
Z.ai×Orbit award = **actually build the project with Z.ai/GLM** + let **Orbie** observe/record the whole process → generate a package at the end → upload to **orbit24.uk (NOT Devpost)**. It scores the process evidence, not the result. 4 lenses × £300 = £1,200 total.

---

## Step 1 · Get a GLM API key
- Get it from **https://zai-hackathon.zeabur.app/** or the GLM/Z.AI Discord group (pinned / dedicated channel).
- Both tools (Claude Code / Cursor) share the same key.

## Step 2 · Connect Claude Code to GLM (Method A: workflow use → Best Workflow Use)
The repo already has a **project-level** `.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "PUT_YOUR_GLM_KEY_HERE",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "API_TIMEOUT_MS": "3000000"
  }
}
```
- Put your key in → launch `claude` in this folder → `/status` confirms GLM is active (Claude model names in the UI are normal — the server maps them).
- Requirements: Claude Code **v2.0.14+**, Node 18+, Git for Windows.
- Default mapping: Opus/Sonnet → **GLM-4.7**, Haiku → **GLM-4.5-Air**.
- To use **GLM-5.1**, add to `env`:
  ```json
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5v-turbo",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  ```
  (GLM-5.1 is premium; during peak hours 14:00–18:00 UTC+8 it draws quota at a higher multiplier.)

## Step 3 · Load Orbie (first message of the session)
```text
Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026.
Acknowledge once, then stay silent until I name you ("Orbie, ...") or use // @orbie in code or trigger capture. Log my code and cognitive layers in the background.
```

## Step 4 · Leave a trail while you build (so the evidence is solid)
1. **State why you use GLM in your prompts** ("I'll use GLM here for the intent parsing because…") → it becomes D1/D2 evidence.
2. **Commit frequently** (Orbie reads commit cadence to judge engineering habits).
3. **Save artifacts**: GLM API screenshots, model comparisons, key prompts into `evidence/`.
4. Summon for feedback (won't interrupt your coding): `Orbie, what have you noticed?` / `Orbie, am I drifting?` / `// @orbie check this` in code.

## Step 5 · Capture + package at the end
- Send `capture my persona` → answer 3 questions (persona name / language / general vs today-specific) → fill the required fields (team name, members, main track = **Vibe with ZYMIX**, project title, what you built, **GitHub URL**, **Devpost URL**, **≥1 demo link**).
- It generates your folder (SKILL.md / manifest.md / zai-orbit-evidence.md / stats.json / evidence/).
- **Members** hand their folder to the leader; **leader** assembles `team-<name>/` + `team-manifest.md`, zips it, and **uploads to orbit24.uk**.

## Three pitfalls
1. The package goes to **orbit24.uk**, NOT Devpost.
2. You must actually use GLM and leave a "why GLM" trail, or every lens records "no evidence".
3. **Build Naturally** — don't force the project around the award; do real work and record the real process.

---

# Method B · Call GLM from inside the Vibe Dice app (→ Best Product Integration)

> Make GLM the product's core engine (quest generation, roll narration, Fate Card structuring, Quest Card copy). Reference code below (Next.js App Router).
> ⚠️ **Confirm the endpoint and model name against the event resources / Discord.** Z.ai's OpenAI-compatible base is usually `https://api.z.ai/api/paas/v4` (product calls) or `https://api.z.ai/api/coding/paas/v4` (coding). Start with `glm-4.6` and swap once confirmed.

### `.env.local`
```bash
GLM_API_KEY=your_glm_key
GLM_BASE_URL=https://api.z.ai/api/paas/v4
GLM_MODEL=glm-4.6
GLM_OFFLINE=false
```

### `lib/glm.ts` — GLM client (OpenAI-compatible)
```ts
type Msg = { role: "system" | "user" | "assistant"; content: string };

const BASE = process.env.GLM_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const KEY = process.env.GLM_API_KEY ?? "";
const MODEL = process.env.GLM_MODEL ?? "glm-4.6";

async function call(messages: Msg[], jsonMode: boolean): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.9, ...(jsonMode ? { response_format: { type: "json_object" } } : {}) }),
  });
  if (!res.ok) throw new Error(`GLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Structured generation: returns the parsed object (caller falls back on failure) */
export async function glmJSON(system: string, user: string): Promise<unknown> {
  const raw = await call([{ role: "system", content: system }, { role: "user", content: user }], true);
  return JSON.parse(raw);
}

/** Plain text generation */
export async function glmText(system: string, user: string): Promise<string> {
  return call([{ role: "system", content: system }, { role: "user", content: user }], false);
}
```

> Strategy baked in: generate the quest/roll/Fate Card/Quest Card with GLM (Product Integration evidence) AND build the code with Claude Code on GLM (Workflow evidence) — covering both Best Product Integration and Best Workflow Use lenses.
