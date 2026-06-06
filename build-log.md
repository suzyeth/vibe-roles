# Vibe Dice — Build Log (VibeHack London 2026)

> Build-in-public log. Doubles as evidence for **Z.ai × Orbit** (build story), **Manus** (workflow), and the Devpost "which AI tools did you use" answer.

## How to use this (daily 3-action loop)
1. **Opening 5 min** — fill **Section 0** (your north star for the whole day).
2. **After each milestone** — add one line to **Section 2** (30 seconds, use the template).
3. **Every time you use an AI** — screenshot the prompt + the output into `VibeHack-screenshots/`, then log a row in **Section 3** (especially failures + how you recovered). Direction changed / feature cut → log it in **Section 1**.

---

## 0. North Star (fill first)
- **Team name:** 49b
- **Members:** Xiaomin Fan, Suzy Su
- **Track:** Track 2 — Vibe with ZYMIX
- **Project:** Vibe Roles (mode: Quest Mode / Roll to Revive)
- **Real problem (one sentence):** ZYMIX group chats go quiet (~72h) and nobody wants to restart the conversation; the cost of speaking up first is high.
- **Target user:** UK Gen Z temporary/buddy/project/event groups — early ZYMIX users + their off-app friends.
- **One-line pitch:** When a group's been quiet for ~72h, one tap has AI randomly generate a DND-like adventure (no chat-history read), assign roles, resolve actions with a D20; external friends can interfere via a 5-minute disappearing invite; ends with a shareable card.
- **Why it belongs in ZYMIX:** a lightweight Mini App one person can start that pulls external friends back into the app.
- **Today's definition of done:** offline demo works + live GLM demo + 3-min script rehearsed + Devpost submitted + Orbit package uploaded.

---

## 1. Decision Log (direction changed / feature cut)
| Time | Decision | Why |
|------|----------|-----|
| (example) 10:40 | Pivot Vibe Roles → **Vibe Dice** (dice + external Fate Cards) | Solo-startable + pulls non-users in; fits ZYMIX's low-download reality |
| (example) 11:15 | All product text → **English** | UK hackathon, English-speaking judges |
|  |  |  |
|  |  |  |

---

## 2. Milestone Log (add a line after each step — 30s)
**Format:** `HH:MM | what you did | tool | problem → fix | next`

```
18:33 | TASK 1: Interactive action selection | Claude Code | ESLint unused vars → removed; test JSON case sensitivity → fixed | TASK 2: Real-human optimizations (Advantage, Prologue ≤3 lines)
18:35 | TASK 2a: Tighten prologue to ≤3 lines | Claude Code | ok | TASK 2b: Condense reactions (already implemented, max 2 unique reactors)
18:41 | TASK 2c: Add Advantage for free-type actions | Claude Code | ok | push changes, verify end-to-end offline demo
18:47 | Add demo checklist + 3-minute script | Claude Code | ok | prepare for live demo + Plan B offline recording
18:52 | Create evidence capture guides | Claude Code | ok | guides ready for ZYMIX screenshots, demo recording, GLM evidence; push to GitHub
```

- 
- 

---

## 3. AI Usage Log (screenshot prompt + output every time)
Screenshots → `VibeHack-screenshots/`, named `HHMM-tool-prompt.png` / `HHMM-tool-output.png` (e.g. `1420-glm-prompt.png`).

| Time | Tool / Model | Used for | Prompt shot | Output shot | Result (success / fail → how recovered) |
|------|-------------|----------|-------------|-------------|------------------------------------------|
| (example) 14:20 | GLM (Z.ai) | generate quest cold-open | 1420-glm-prompt.png | 1420-glm-output.png | first output too terse → re-prompted "2-4 vivid sentences" → rich |
| (example) 15:05 | Fotor | Quest Card visual | 1505-fotor-prompt.png | 1505-fotor-output.png | success |
| (example) 15:40 | Manus | competitor research | 1540-manus-prompt.png | 1540-manus-output.png | success, saved link |
| 18:25 | GLM (Z.ai) | generate action options during gameplay | 1825-glm-prompt.png | 1825-glm-output.png | (will be captured during demo run) |
| 18:25 | Claude Code | add ActionOptionsSchema, buildActionsPrompt, fallbackActions, /api/actions route, update roll route, page.tsx turn-based UI, tests |  |  | all tests green (37), build ok, no issues | |
|  |  |  |  |  |  |

---

> Tip: this file IS your Best Build-in-Public Story for Z.ai × Orbit. Keep it honest — the failures + recoveries are worth the most.
