# Demo Recording Guide — Vibe Dice

> VibeHack London 2026 — 3-minute live demo + 30-second Plan B

---

## Equipment Checklist

- [ ] Screen recording software (OBS / Windows Game Bar / QuickTime)
- [ ] Audio: built-in mic or external headset
- [ ] Browser: Chrome latest, incognito (clean state)
- [ ] App running: `npm run dev` at http://localhost:3000
- [ ] GLM connected (GLM_OFFLINE=false)
- [ ] Offline test ready (GLM_OFFLINE=true)

---

## Recording Script (3-minute live)

### 0:00–0:15 | Hook + Problem Statement
**Visual:** Empty group chat (DEAD_GROUP)
**Say:** "This is a real ZYMIX group chat. Three days ago, someone asked 'anyone free this weekend?' — silence. The problem isn't that people don't want to talk — they just don't know what to say first."
**Action:** Point to "Chat's gone cold? Roll to revive it"

### 0:15–0:30 | Start the Quest
**Action:** Tap "The Unread Beast" theme
**Visual:** Loading → 3-line prologue → player cards
**Say:** "The AI casts everyone into roles. Mia's the Overthinking Wizard, Kai's the Ghost Rogue, Momo's the Chaos Bard — and you're the Snack Healer."

### 0:30–0:45 | Round 1 — Choose & Roll
**Visual:** Active player highlighted → 3 action buttons
**Action:** Tap action button → roll dice
**Say:** "On your turn, you choose what to do. The dice decides HOW WELL it goes. Action equals WHAT, dice equals HOW WELL."

### 0:45–1:00 | Round 1 Result
**Visual:** Result banner → narration → 2 reactions
**Say:** "You rolled a 12 — it works, but leaves a problem. The AI narrates the outcome, and your teammates drop in-character one-liners. This is a conversation, not a slot machine."

### 1:00–1:30 | Round 2 — Rotate & Share
**Visual:** Active player rotates → after roll, share link appears
**Action:** Show share URL
**Say:** "Even friends who haven't downloaded ZYMIX can shape the story. They open this link and add Fate Cards — characters, curses, rules — and the AI weaves them into the next round."

### 1:30–2:00 | Round 3 — Advantage
**Visual:** Active player rotates → type custom action
**Action:** Type "Try to talk the pigeon down" → tap Go → Advantage dice (amber)
**Say:** "If you come up with your own creative action, you get Advantage — roll twice and keep the higher. Smart play is rewarded, not just luck."

### 2:00–2:30 | Quest Card
**Visual:** Final roll → Quest Card pops up
**Say:** "After 3 rounds, you get a shareable Quest Card. It captures the whole story — the chaos, the interference, the best moments."

### 2:30–3:00 | Close
**Action:** Tap "Play again"
**Say:** "One user is enough to start. The story spreads via WhatsApp. External friends join without downloading. The Quest Card pulls them back to ZYMIX. This is Vibe Dice — the Mini App that revives cold chats."

---

## Plan B — 30-Second Offline Demo

**If GLM fails or you want a safety net:**

1. Set `GLM_OFFLINE=true` in `.env.local`
2. Restart dev server
3. Record this flow (30 seconds max):

```
0:00 "Let me show you the offline demo — it never crashes."
0:05 Show cold chat → tap theme → 3-line prologue
0:15 "Players get roles, action buttons appear."
0:20 Tap action → roll → result + reactions
0:25 "Three rounds → Quest Card → shareable."
0:30 "One person starts, friends interfere via WhatsApp. Done."
```

---

## Recovery Flow (if something breaks during live demo)

| Issue | What to Say | What to Do |
|-------|-------------|-------------|
| GLM timeout | "We're running offline for stability" | Continue (fallback active) |
| Action buttons missing | "Actions fall back to presets" | Continue |
| Narration missing | "Fallback narration kicks in" | Continue |
| Quest card fails | "Fallback card appears" | Continue |

**Rule:** Never pause, never apologize, never show code. Switch to fallback and keep the story moving.

---

## Post-Recording

- [ ] Save recording as `demo-live-3min.mp4` (or `.mov`)
- [ ] Save Plan B as `demo-planb-30sec.mp4`
- [ ] Place in `evidence/` folder
- [ ] Check audio quality
- [ ] Check no personal data visible
- [ ] Total时长 ≈ 3 minutes (live), ≈ 30 seconds (Plan B)

---

> Upload to Devpost in the "Demo" section
> Keep both versions available as backup