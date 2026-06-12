# 🎭 Roll Call

> 🏆 **Best Product Integration with Z.ai** — Z.ai × Orbit award, VibeHack London 2026

[![Live demo](https://img.shields.io/badge/▶%20Live%20demo-vibe--roles.vercel.app-1DB954)](https://vibe-roles.vercel.app)
[![Devpost](https://img.shields.io/badge/Devpost-Roll%20Call-003E54?logo=devpost&logoColor=white)](https://devpost.com/software/roll-call-fvq7oy)
[![Tests](https://img.shields.io/badge/tests-128%20passing-1DB954)](#-tests)

**Turn a dead group chat into a 2-minute AI roleplay adventure — everyone gets a role, rolls the dice, and writes the story together.**

Roll Call is a ZYMIX-native mini app. When a group chat has gone quiet for ~72 hours, a gentle prompt slides in: *"This group's been quiet for a while. Start a small adventure?"* Tap **Yes** and the whole group drops into a branching, DnD-style story — pick a move, roll a **D20**, and the roll routes the plot. It ends with a shareable, outcome-themed Quest Card.

▶️ **Play now:** https://vibe-roles.vercel.app  ·  📋 **Devpost:** https://devpost.com/software/roll-call-fvq7oy

---

## ✨ How it plays

- **Cold-chat trigger** — a quiet group gets one low-pressure nudge, delivered as a chat bubble (Yes / No), not a banner.
- **You-led branching story** — you're the protagonist of a hand-authored story tree. Each beat is a scene + two choices; your **D20** decides success/failure and *routes the branch*, so both your choice and your roll change the path, the tension, and the ending.
- **A cast, not a menu** — every member is assigned a themed role (with a one-line character detail). AI teammates auto-play their turns locally and react in-chat — present, never spammy.
- **5-minute disappearing invite** — an outside friend can drop exactly one *twist* into the story (bend the plot, add a character, raise the stakes…) via a link that self-destructs.
- **Doom clock + dice tiers** — failures raise the tension meter; a nat-20 leaves a **boon**, a nat-1 leaves a **scar**, both surfaced at the end.
- **Outcome-themed ending card** — a real written ending tinted by result (🏆 win / 🤝 bittersweet / 🫥 unravelled), plus the night's highlight, what you carried, and the turning points.
- **Four stories, each its own colour** — Group Chat on Trial · The Ring Light Goes Dark · Locked In at Honeycomb · Two Texts, One Group Chat.
- **Light + dark, fully English, zero wait** — no login, no loading; instant and deterministic.

## 🧩 How the story works (honest note)

The shipped build runs on **pre-written branching story trees** ([`data/branchingStories.ts`](./data/branchingStories.ts) + [`lib/branchingEngine.ts`](./lib/branchingEngine.ts)) — fully offline and deterministic, so play is instant and demo-safe, with **no live LLM call** in the gameplay loop.

The repo also keeps an optional GLM / Z.ai live-generation path from an earlier iteration (`lib/glm.ts` + `app/api/*`); it is **not wired into the current flow** (`GLM_OFFLINE=true`). Z.ai's GLM powered the **build itself** — Claude Code ran on GLM throughout the hackathon.

## 🛠 Tech

`Next.js 14` (App Router) · `TypeScript` · `React 18` · `Tailwind CSS` · `Zod` · `Vitest` · deployed on **Vercel** · built with **Claude Code on Z.ai GLM**.

## 🚀 Run locally

```bash
git clone https://github.com/suzyeth/vibe-roles
cd vibe-roles
npm install
npm run dev   # http://localhost:3000
```

Runs **fully offline** on scripted story trees — no API key required.

## 🧪 Tests

```bash
npm run test      # vitest — 128 passing
npx tsc --noEmit  # type-check
```

## 👥 Team

VibeHack London 2026 · Track 2 *"Vibe with ZYMIX"* · Team **49b** — Xiaomin Fan & Suzy Su.

## 📚 Docs

- [DESIGN.md](./DESIGN.md) — product design (72h cold prompt, branching story tree, D20, 5-min invite, story state)
- [PLAN.md](./PLAN.md) — architecture & status
- [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md) — 3-minute demo runbook
- [build-log.md](./build-log.md) — build-in-public log (keeps earlier names: Vibe Dice → Vibe Roles → Side Quest → Roll Call)

<details>
<summary>🧰 Hackathon dev setup (GLM coding model, Orbie, persona capture)</summary>

> These steps are only for rebuilding the project the way it was made at the hackathon — they are **not** needed to run or play the app (which is offline).

**1. Connect GLM as the Claude Code build model** (`.claude/settings.json` is preconfigured)
- Get a GLM API key from `https://zai-hackathon.zeabur.app/` (or the GLM Discord group), and replace the placeholder in `.claude/settings.json`.
- For GLM-5.1, add to `env`: `"ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5v-turbo"`, `"ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"`.

**2. Launch Claude Code in this folder**, then run `/status` to confirm GLM is active (the UI may still show Claude model names — that's normal).

**3. Load Orbie** (first message):
```text
Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026.
Acknowledge once, then stay silent until I name you or trigger capture. Log my code and cognitive layers in the background.
```

**4. At the end** — `capture my persona` → fill the fields → team leader zips and uploads to `orbit24.uk`.

Other links: [Ortie instructions](https://orbit24.uk/ortie.md) · [Manus event](https://manus.im/live-events/EVENT-4022) · [Fotor guidance](https://docs.google.com/document/d/1FnOiqmQWjoWLAktPTt81D0cspQYlE8PdJJprY0vURo0/edit)

</details>
