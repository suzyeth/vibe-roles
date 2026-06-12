# Roll Call

> 🏆 **Best Product Integration with Z.ai** — Z.ai × Orbit award, VibeHack London 2026

[![Live demo](https://img.shields.io/badge/▶%20Live%20demo-vibe--roles.vercel.app-1DB954)](https://vibe-roles.vercel.app)
[![Devpost](https://img.shields.io/badge/Devpost-Roll%20Call-003E54?logo=devpost&logoColor=white)](https://devpost.com/software/roll-call-fvq7oy)

A ZYMIX-native cold-group-revival mini game. When a group chat has been quiet for ~72 hours, a light prompt appears: *"This group's been quiet for a while. Start a mini adventure?"* If one person taps Start, a **branching story tree** kicks off — a hand-authored DnD-style scenario (it never reads your chat history) — and each member is assigned a role. Players pick a branch or type their own line, roll a **D20** to resolve, and the roll **routes the branch**, so every choice changes the path, the tension, and the ending. AI teammates auto-play their turns locally; an external friend can drop one twist via a **5-minute disappearing invite**. It ends with a shareable, outcome-themed ending card.

VibeHack London 2026 · Track 2 "Vibe with ZYMIX". Full design: [DESIGN.md](./DESIGN.md).

> **Story engine (honest note):** the shipped build runs on **pre-written branching story trees** ([`data/branchingStories.ts`](./data/branchingStories.ts) + [`lib/branchingEngine.ts`](./lib/branchingEngine.ts)) — fully offline and deterministic, so play is instant and demo-safe, with **no live LLM call** in the gameplay loop. The repo also keeps an optional GLM / Z.ai live-generation path from an earlier iteration (`lib/glm.ts` + `app/api/*`); it is **not wired into the current flow** (`GLM_OFFLINE=true`). Z.ai's GLM powered the **build itself** — Claude Code ran on GLM throughout the hackathon.

> Naming note: the product is **Roll Call** (mode: *Quest Mode / Roll to Revive*). Some files/code may still say the earlier name "Roll Call" — DESIGN.md is the latest source of truth.

## Quick start

### 1. Connect GLM — for Claude Code as the build model (`.claude/settings.json` is preconfigured)
> Optional for *running* the app: the prototype plays fully offline (scripted stories). GLM here powers **Claude Code** as the coding model used to build the project during the hackathon.
- Get a GLM API key from `https://zai-hackathon.zeabur.app/` (or the GLM Discord group).
- Open `.claude/settings.json` and replace the placeholder with your key.
- To use GLM-5.1, add to `env`: `"ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5v-turbo"`, `"ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"` (GLM-5.1 is premium; peak hours 14:00–18:00 UTC+8 cost more).

### 2. Launch Claude Code in this folder
```powershell
cd C:\Users\ASUS\Desktop\VibeRoles
claude
```
Run `/status` to confirm GLM is active (UI may still show Claude model names — that's normal).

### 3. Load Orbie (first message)
```text
Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026.
Acknowledge once, then stay silent until I name you or trigger capture. Log my code and cognitive layers in the background.
```

### 4. Run the prototype (offline fallback works out of the box)
```powershell
npm install
npm run dev   # http://localhost:3000
```
The gameplay runs on **offline scripted story trees**, so the whole flow works with no API key (`.env.local` defaults to `GLM_OFFLINE=true`).

### 5. At the end
- `capture my persona` → fill the fields → team leader zips and uploads to `orbit24.uk`.

## Key links
- 🏆 Best Product Integration with Z.ai — Z.ai × Orbit award, VibeHack London 2026
- Live demo (Vercel): https://vibe-roles.vercel.app
- Devpost submission: https://devpost.com/software/roll-call-fvq7oy
- GLM key: https://zai-hackathon.zeabur.app/
- Ortie instructions: https://orbit24.uk/ortie.md
- Manus registration: https://manus.im/live-events/EVENT-4022
- Fotor guidance: https://docs.google.com/document/d/1FnOiqmQWjoWLAktPTt81D0cspQYlE8PdJJprY0vURo0/edit

## Doc map
- [DESIGN.md](./DESIGN.md) — product design (latest: Roll Call, 72h cold prompt, branching story tree, D20, 5-min invite, story_state)
- [SPEC.md](./SPEC.md) — engineering spec (predates this revision; reconcile naming/dice labels to DESIGN.md)
- [PLAN.md](./PLAN.md) — architecture & status
- [ORBIT-GLM-GUIDE.md](./ORBIT-GLM-GUIDE.md) — Z.ai×Orbit + GLM setup
- [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md) — 3-minute demo runbook
- [SPRINT-30MIN.md](./SPRINT-30MIN.md) — 30-minute opening sprint
- [build-log.md](./build-log.md) — build-in-public log
