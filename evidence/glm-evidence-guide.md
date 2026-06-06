# GLM Evidence Capture — Orbit × Z.ai Award

> ORBIT-GLM-GUIDE.md §4 — build-in-public evidence required

---

## What to Capture

Each time GLM is used in-app (during demo), capture:
1. **Prompt** — the system + user prompt sent to GLM
2. **Output** — the raw JSON response from GLM
3. **Context** — what feature / round this was for

---

## Naming Convention

Format: `HHMM-feature-prompt.png` / `HHMM-feature-output.png`

| Feature | Prompt Filename | Output Filename |
|---------|-----------------|-----------------|
| Quest generation | `HHMM-quest-prompt.png` | `HHMM-quest-output.png` |
| Action options | `HHMM-actions-prompt.png` | `HHMM-actions-output.png` |
| Roll narration | `HHMM-roll-prompt.png` | `HHMM-roll-output.png` |
| Fate Card | `HHMM-fate-prompt.png` | `HHMM-fate-output.png` |
| Quest Card | `HHMM-questcard-prompt.png` | `HHMM-questcard-output.png` |

---

## How to Capture

### Method A: Browser DevTools (Easiest)
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Start demo / test
4. Filter by `paas/v4/chat/completions` (GLM endpoint)
5. Click request → find JSON in Response body
6. Take screenshots of Request Payload (prompt) and Response (output)

### Method B: Code Inspector
1. During demo, open `lib/glm.ts`
2. Add `console.log({ system, user })` before fetch
3. Add `console.log({ result })` after parse
4. Take screenshots from Console tab
5. Remove after capture (don't commit debug code)

---

## build-log.md §3 Entries

After each GLM call, add a row:

```
| 18:47 | GLM (Z.ai) | generate action options during gameplay | 1847-actions-prompt.png | 1847-actions-output.png | success, generated 3 contextual options |
```

| Time | Tool / Model | Used for | Prompt shot | Output shot | Result |
|------|-------------|----------|-------------|-------------|--------|
| [Fill] | GLM (Z.ai) | [Fill] | [Fill] | [Fill] | [Fill] |

---

## Evidence Folder Structure

```
evidence/
├── zymix-firsthand/          # ZYMIX screenshots
├── glm-evidence/              # GLM prompts + outputs
│   ├── 1847-quest-prompt.png
│   ├── 1847-quest-output.png
│   ├── 1852-actions-prompt.png
│   └── ...
└── demo/                      # Demo recordings
    ├── demo-live-3min.mp4
    └── demo-planb-30sec.mp4
```

---

> Keep all screenshots for Orbit package
> Update build-log.md as you capture