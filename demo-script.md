# Roll Call — 3-Minute Demo Script

> VibeHack London 2026 — Track 2 "Vibe with ZYMIX"
> Target: 3-minute live demo + 30-second Plan B offline version

---

## 0:00–0:15 | Hook + Problem Statement

**Visual:** Show empty group chat (DEAD_GROUP)

**Say:** "This is a real ZYMIX group chat. Three days ago, someone asked 'anyone free this weekend?' — silence. The problem isn't that people don't want to talk — they just don't know what to say first."

**Action:** Point to the "Chat's gone cold? Roll to revive it" prompt

---

## 0:15–0:30 | Start the Quest

**Action:** Tap "The Unread Beast" theme

**Visual:**
- Loading spinner: "Rolling up your quest… 🎲"
- 3-line prologue reveals (tap to advance or auto-play)
- Player cards appear: Mia (🦌), Kai (🧢), Momo (🐱), You (🫵)

**Say:** "The AI casts everyone into roles. Mia's the Overthinking Wizard, Kai's the Ghost Rogue, Momo's the Chaos Bard — and you're the Snack Healer."

---

## 0:30–0:45 | Round 1 — Choose & Roll

**Visual:**
- Active player card highlighted (fuchsia ring)
- 3 action buttons appear
- "Or type your own action…" input

**Action:** Tap "Analyze the symbols on the wall" button
- Player's action appears as chat message
- Dice appears — click to roll

**Say:** "On your turn, you choose what to do. The dice decides HOW WELL it goes. Action equals WHAT, dice equals HOW WELL."

---

## 0:45–1:00 | Round 1 Result

**Visual:**
- Dice rolls → result banner (e.g., "🎲 12 · Works Somehow")
- Narration reveals (2-4 vivid sentences)
- 2 reactions from other players appear

**Say:** "You rolled a 12 — it works, but leaves a problem. The AI narrates the outcome, and your teammates drop in-character one-liners. This is a conversation, not a slot machine."

---

## 1:00–1:30 | Round 2 — Rotate & Share

**Visual:**
- Active player rotates (Kai highlighted)
- New action options appear
- After roll → share link appears

**Action:** Tap "Let WhatsApp friends interfere" → show share URL

**Say:** "Even friends who haven't downloaded ZYMIX can shape the story. They open this link and add Fate Cards — characters, curses, rules — and the AI weaves them into the next round."

---

## 1:30–2:00 | Round 3 — Free-type with Advantage

**Visual:**
- Active player rotates (Momo highlighted)
- Type custom action in input field: "Try to talk the pigeon down"

**Action:**
- Type action → tap "Go"
- Dice appears with amber gradient → "Advantage!" badge
- Roll twice, keep higher

**Say:** "If you come up with your own creative action, you get Advantage — roll twice and keep the higher. Smart play is rewarded, not just luck."

---

## 2:00–2:30 | Ending — Quest Card

**Visual:**
- Final roll → twist narration
- Quest Card pops up: "Quest Completed | chaotic but alive | Best Interference: Food Metaphor Curse | Final Roll: 18"

**Action:** Show card can be saved/shared

**Say:** "After 3 rounds, you get a shareable Quest Card. It captures the whole story — the chaos, the interference, the best moments."

---

## 2:30–3:00 | Close + Why It Belongs

**Action:** Tap "Play again" → return to start

**Say:** "One user is enough to start. The story spreads via WhatsApp. External friends join without downloading. The Quest Card pulls them back to ZYMIX. This is Roll Call — the Mini App that revives cold chats."

---

## Plan B — 30-Second Offline Demo

**If GLM fails, run this pre-recorded version:**

```
0:00 "Let me show you the offline demo — it never crashes."
0:05 Show cold chat → tap theme → 3-line prologue appears
0:15 "Players get roles, action buttons appear."
0:20 Tap action → roll → result + reactions
0:25 "Three rounds → Quest Card → shareable."
0:30 "One person starts, friends interfere via WhatsApp. Done."
```

**Key points to hit:**
- Never crashes (GLM_OFFLINE=true forced)
- Full 3-round loop in ~3 minutes
- Turn-based with active player highlight
- Action choice + dice outcome
- Quest Card at end
- External interference via WhatsApp link

---

## Recovery Flow (if something breaks)

| Issue | Recovery |
|-------|-----------|
| GLM API timeout | "We're running offline mode for stability" → proceed |
| Action buttons don't load | "Actions fallback to 3 presets" → proceed |
| Narration missing | "Fallback narration kicks in" → proceed |
| Quest Card generation fails | "Fallback card appears" → proceed |

**Rule:** Never pause, never apologize, never show code. Switch to fallback and keep the story moving.