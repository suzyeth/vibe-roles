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
- **Project:** Vibe Dice
- **Real problem (one sentence):** ZYMIX group chats go cold and early users don't know what to say first — and many real friends aren't even on the app yet.
- **Target user:** UK Gen Z (students / young urban), early ZYMIX users + their off-app friends.
- **One-line pitch:** One tap turns a dead chat into a 3-minute AI dice adventure; friends outside ZYMIX can shape the story via WhatsApp; it ends with a shareable Quest Card.
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
14:20 | Generated the cold-open scene | GLM | too short → asked for 2-3 vivid sentences → fixed | add role cards
```

- 
- 
- 
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
|  |  |  |  |  |  |
|  |  |  |  |  |  |

---

> Tip: this file IS your Best Build-in-Public Story for Z.ai × Orbit. Keep it honest — the failures + recoveries are worth the most.
