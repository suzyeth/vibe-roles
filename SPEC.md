# Vibe Dice — Full Product Spec (SPEC v1.0)

> This document is the single implementation reference for engineers. All rules, data structures, state machine, and AI prompt specs are defined here.
> Product background & track info: see DESIGN.md. Tech architecture: see PLAN.md.
> Last updated: 2026-06-06
>
> ⚠️ RECONCILE: DESIGN.md was revised after this spec and is the latest product truth — where they differ, DESIGN.md wins. Deltas to fold into this spec: product name **Vibe Roles** (not "Vibe Dice"); dice labels **Critical Fail / Fail / Partial Progress / Success / Strong Success / Critical Success**; trigger = **72h inactivity, no chat-history read** (controlled-random story); persistent **story_state** (clues / relationships / consequences / location & character status); **6** external-intervention types (Event / Message / Character / Object / Rule / Condition) via a **5-minute disappearing invite**; demo story **"The 404 Customer"** (Luna / Jake / Kai / Alex / Emma).

---

## 0. One-line positioning (engineer version)

**Vibe Dice is a multiplayer, turn-based AI dice-story game that runs inside a Zymix group chat.**

- Each player takes turns choosing an action + rolling the die; the roll decides success/failure, and the AI Game Master narrates in real time based on "the previous player's result + the current player's action".
- Game length is variable; players can trigger "Wrap it up" anytime to jump to the ending.
- External friends submit Fate Cards via a WhatsApp link (Demo version is pre-seeded, no live submission).
- Each run generates a shareable Quest Card.

---

## 1. Full game state machine

### 1.1 Phases

```
COLD_CHAT          cold group-chat screen (entry)
  ↓ tap "Roll to revive"
SETUP              enter player names (1–4)
  ↓ confirm count
THEME_SELECT       pick a theme (4 presets or AI random)
  ↓ choose theme
OPENING            AI generates opening + role assignment (one structured LLM call)
  ↓ animation done
PLAYING            main loop (multi-Beat, turn-based)
  ↓ player triggers "Wrap it up" OR beat count hits cap (default 12)
CLIMAX             final beat (each player takes one Final Roll)
  ↓ all done
ENDING             AI generates the ending narration
  ↓ narration done
QUEST_CARD         Quest Card shown + share
```

### 1.2 PLAYING sub-state machine

PLAYING is the core loop with its own sub-states:

```
BEAT_NARRATING     AI narration typewriter output (this beat's opening narration)
  ↓ done
ACTION_SELECT      active player chooses an action (2–3 AI options or free input)
  ↓ player chooses (or 30s timeout → AI auto-picks)
DICE_ROLLING       dice roll animation (1–2s)
  ↓ done
RESULT_NARRATING   AI narrates based on "action + dice result" (typewriter)
  ↓ done
BEAT_END           beat ends, check whether to continue
  ↓ next player → back to BEAT_NARRATING
  ↓ player taps "Wrap it up" → CLIMAX
```

---

## 2. Core data structures (TypeScript)

### 2.1 Player & Role

```typescript
interface Player {
  id: string;           // unique id, e.g. "p1"
  name: string;         // player's real name, e.g. "Jamie"
  avatar: string;       // emoji, e.g. "🧑‍🦱"
  color: string;        // hex color for bubbles and highlights
  isAI?: boolean;       // true = AI-filled NPC (when player count is low)
}

interface Role {
  playerId: string;
  roleName: string;     // e.g. "The Overthinking Wizard"
  ability: string;      // one-line ability, e.g. "Detect hidden awkwardness"
  emoji: string;        // role emoji
}
```

### 2.2 Dice system

```typescript
type DiceResult =
  | 'total-chaos'           // 1
  | 'awkward-fail'          // 2–5
  | 'messy-progress'        // 6–10
  | 'works-somehow'         // 11–15
  | 'main-character-moment' // 16–19
  | 'iconic-roll';          // 20

interface DiceRoll {
  value: number;            // 1–20
  result: DiceResult;
  label: string;            // display text, e.g. "Messy Progress"
  emoji: string;            // e.g. "😅"
  color: string;            // result color
}

const DICE_MAP: Record<DiceResult, { label: string; emoji: string; color: string; range: [number, number] }> = {
  'total-chaos':           { label: 'Total Chaos',           emoji: '💀', color: '#EF4444', range: [1, 1]   },
  'awkward-fail':          { label: 'Awkward Fail',          emoji: '😬', color: '#F97316', range: [2, 5]   },
  'messy-progress':        { label: 'Messy Progress',        emoji: '😅', color: '#EAB308', range: [6, 10]  },
  'works-somehow':         { label: 'Works Somehow',         emoji: '😌', color: '#22C55E', range: [11, 15] },
  'main-character-moment': { label: 'Main Character Moment', emoji: '😎', color: '#3B82F6', range: [16, 19] },
  'iconic-roll':           { label: 'Iconic Roll',           emoji: '🔥', color: '#8B5CF6', range: [20, 20] },
};

function rollDice(): DiceRoll {
  const value = Math.floor(Math.random() * 20) + 1;
  // match value against DICE_MAP ranges
  // ...
}
```

### 2.3 Beat (a single turn)

```typescript
interface Beat {
  beatIndex: number;        // global beat number, from 0
  playerId: string;         // acting player for this beat
  roundIndex: number;       // which round (everyone acting once = one round)

  // ACTION_SELECT
  actionOptions: string[];  // 2–3 AI-generated options
  chosenAction: string | null;  // chosen action (or free input)
  autoPlayed: boolean;      // true = timed out, AI auto-picked

  // DICE_ROLLING
  roll: DiceRoll | null;

  // RESULT_NARRATING
  narration: string;        // AI result narration (2–4 sentences)

  // Fate Card (Demo pre-seeded)
  fateCardApplied?: FateCard;  // Fate Card activated this beat (if any)
}
```

### 2.4 Fate Card (Demo pre-seeded version)

```typescript
type FateCardType = 'character' | 'object' | 'curse' | 'rule' | 'blessing';

interface FateCard {
  id: string;
  type: FateCardType;
  title: string;            // e.g. "The Sunglasses Pigeon"
  effect: string;           // e.g. "Appears when roll < 10, offers suspicious advice"
  submittedBy: string;      // external friend name, e.g. "Maya (WhatsApp)"
  triggerCondition: 'next_beat' | 'roll_under_10' | 'round_2' | 'manual';
  applied: boolean;         // whether the AI has woven it in
}

const DEMO_FATE_CARDS: Record<string, FateCard[]> = {
  'flat-drama': [
    { id: 'fc1', type: 'curse', title: 'Food Metaphor Mode', effect: 'All dialogue must sound like dinner is a psychological condition.', submittedBy: 'Sarah (WhatsApp)', triggerCondition: 'round_2', applied: false },
    { id: 'fc2', type: 'character', title: 'The Suspicious Landlord', effect: 'Appears and demands rent evidence for everything.', submittedBy: 'Tom (WhatsApp)', triggerCondition: 'roll_under_10', applied: false },
  ],
  // ... other themes
};
```

### 2.5 Quest (full game state)

```typescript
interface Quest {
  id: string;
  theme: Theme;
  players: Player[];
  roles: Role[];
  openingNarration: string;
  beats: Beat[];
  fateCards: FateCard[];
  pendingFateCards: FateCard[];
  status: 'playing' | 'climax' | 'ended';
  endingNarration: string;
  questCard: QuestCard | null;
}

interface QuestCard {
  title: string;              // e.g. "The Unread Beast Was Defeated"
  caption: string;            // e.g. "Chaotic but alive"
  bestRoll: { playerName: string; value: number; label: string };
  bestInterference: FateCard | null;
  highlights: string[];       // 2–3 AI-generated highlight moments
  cta: string;                // "Start your own quest on Zymix"
}
```

---

## 3. AI call spec

### 3.1 Overview

| Call | When | Input | Output | Streaming |
|---|---|---|---|---|
| Call 1 | OPENING | theme + player names | opening narration + role cards + first beat's action options | No (structured JSON) |
| Call 2 | each beat's ACTION_SELECT | story summary + last beat result + current player role + pending Fate Cards | 2–3 action options | No (structured JSON) |
| Call 3 | each beat's RESULT_NARRATING | current action + dice result tier + last beat narration summary + active Fate Cards | result narration (2–4 sentences) | Yes (streaming typewriter) |
| Call 4 | ENDING | all beat summaries + final roll result | ending narration + Quest Card copy | Yes (streaming typewriter) |

### 3.2 Call 1: opening generation
**Trigger:** after the player confirms the theme, enter OPENING.

```
You are the AI Game Master for Vibe Dice, a Gen Z social micro-adventure game.

THEME: {theme.label} — {theme.setup}
PLAYERS: {players.map(p => p.name).join(', ')}
TONE: Playful, Gen Z English, PG-safe. No violence, no explicit content.

Generate a JSON response with this exact schema:
{
  "opening": "string — A vivid 2–4 sentence cold open. High stakes, a mystery or ticking problem. End with a hook.",
  "roles": [
    {
      "playerId": "string — must match one of: {players.map(p => p.id).join(', ')}",
      "roleName": "string — a fun Gen Z archetype, e.g. 'The Overthinking Wizard'",
      "ability": "string — one short sentence, e.g. 'Can detect hidden awkwardness from 10 metres'",
      "emoji": "string — one emoji"
    }
  ],
  "firstActionOptions": [
    "string — 2–3 concrete action options for the FIRST player ({players[0].name}), based on the opening scene"
  ]
}

Rules:
- opening must reference the theme and feel urgent
- each role must feel unique and match the player's name vibe
- firstActionOptions must be specific to the scene, not generic ("investigate the fridge" not "look around")
- all text in English
```
**Fallback:** `fallback.ts` pre-seeds a full opening + roles + firstActionOptions per theme; use it directly if Call 1 fails.

### 3.3 Call 2: action options
**Trigger:** when a beat enters ACTION_SELECT.

```
You are the AI Game Master for Vibe Dice.

CURRENT STORY CONTEXT:
- Theme: {theme.label}
- Round: {roundIndex + 1}
- Last beat result: {lastBeat ? `${lastBeat.chosenAction} → ${lastBeat.roll.label}: ${lastBeat.narration.slice(0, 100)}...` : 'Game just started'}
- Active Fate Cards: {pendingFateCards.map(fc => `[${fc.type.toUpperCase()}] ${fc.title}: ${fc.effect}`).join('; ') || 'None'}

CURRENT PLAYER:
- Name: {currentPlayer.name}
- Role: {currentRole.roleName}
- Ability: {currentRole.ability}

Generate a JSON response:
{
  "actionOptions": [
    "string — 2 to 3 concrete action options. Each must be a short verb phrase (max 8 words). They must be specific to the current story moment, not generic. If a Fate Card is active, at least one option should acknowledge it."
  ]
}

Rules:
- Options must escalate tension from the last beat
- If last roll was Total Chaos or Awkward Fail, options should reflect a harder situation
- If last roll was Main Character Moment or Iconic Roll, options can be bolder
- Never repeat options from previous beats
- All text in English, Gen Z tone
```
**Fallback:** return 3 generic options: `["Investigate the situation", "Ask for help", "Try something unexpected"]`

### 3.4 Call 3: result narration (streaming)
**Trigger:** after the player picks an action + the dice result is set.

```
You are the AI Game Master for Vibe Dice. Narrate the outcome of this action.

PLAYER: {currentPlayer.name} ({currentRole.roleName})
ACTION CHOSEN: "{chosenAction}"
DICE RESULT: {roll.value}/20 — {roll.label} ({roll.emoji})

STORY CONTEXT:
- Theme: {theme.label}
- Previous beat (for continuity): "{lastNarration || 'Opening scene'}"
- Active Fate Cards being woven in: {activeFateCards.map(fc => `[${fc.type.toUpperCase()}] ${fc.title}: ${fc.effect}`).join('; ') || 'None'}

DICE RESULT GUIDE:
- Total Chaos (1): Critical failure. The most absurd, chaotic consequence. Something goes very wrong.
- Awkward Fail (2–5): Failure with a funny twist. It didn't work, but in an embarrassing way.
- Messy Progress (6–10): Partial success with a cost. It kind of worked, but now there's a new problem.
- Works Somehow (11–15): Success, but it leaves a loose end. Something is still unresolved.
- Main Character Moment (16–19): Clear success. {currentPlayer.name} gains an edge.
- Iconic Roll (20): Huge success. A highlight moment. The whole group benefits.

Write 2–4 vivid sentences:
1. Directly narrate what happened as a result of "{chosenAction}" — the outcome MUST match the dice result.
2. React to the Fate Card if one is active (weave it in naturally, not as a bullet point).
3. End with a light hook or cliffhanger that sets up the next player's turn.
4. Address {currentPlayer.name} by their role name at least once.
5. Include 1 short in-character reaction line from another player (not {currentPlayer.name}), e.g. '{otherPlayer.name} mutters: "..."'

Tone: Playful, Gen Z English, PG-safe. No violence, no explicit content.
Output plain text only — no JSON, no markdown.
```
**Fallback:** take the matching-tier generic narration from `fallback.ts` by `roll.result`, replacing `{name}` and `{action}` placeholders.

### 3.5 Call 4: ending + Quest Card (streaming)
**Trigger:** after all players finish their Final Roll in CLIMAX.

```
You are the AI Game Master for Vibe Dice. Write the ending and generate the Quest Card.

QUEST SUMMARY:
- Theme: {theme.label}
- Players: {players.map(p => `${p.name} (${roles[p.id].roleName})`).join(', ')}
- Total beats: {beats.length}
- Best roll: {bestRoll.playerName} rolled {bestRoll.value} ({bestRoll.label})
- Worst roll: {worstRoll.playerName} rolled {worstRoll.value} ({worstRoll.label})
- Fate Cards used: {appliedFateCards.map(fc => fc.title).join(', ') || 'None'}
- Story so far (beat narrations): {beats.map(b => b.narration).join(' | ')}

Generate a JSON response:
{
  "endingNarration": "string — A twist ending in 3–5 sentences. Must reference what actually happened in the beats. Resolve the main conflict in a surprising or funny way. End on a high note.",
  "questCard": {
    "title": "string — A punchy quest title, e.g. 'The Unread Beast Was Defeated'",
    "caption": "string — A 3–5 word mood summary, e.g. 'Chaotic but alive'",
    "highlights": ["string — 2–3 short highlight moments from the actual beats, referencing real player names and actions"],
    "bestInterferenceCaption": "string — If a Fate Card was used, one sentence about its impact. If none, 'No outside interference — pure chaos within.'",
    "cta": "Start your own quest on Zymix"
  }
}
```
**Fallback:** `fallback.ts` pre-seeds a generic ending + Quest Card template per theme.

---

## 4. Detailed turn rules

### 4.1 Player order
- At game start, player order follows the order entered in SETUP (Player 1, 2, 3...).
- Each beat passes to the next player, looping (P1 → P2 → P3 → P1...).
- AI-filled NPC players (`isAI: true`) skip ACTION_SELECT — the system generates their action and rolls directly.

### 4.2 Action-option chain-reaction rule (core)
When Call 2 generates options, it MUST receive the previous beat's `roll.result` and adjust difficulty:

| Last beat result | Current player's option style |
|---|---|
| Total Chaos | Options are all "save the situation" / "clean up the mess", hardest |
| Awkward Fail | One "fix it" option and one "give up fixing" option |
| Messy Progress | One option must deal with the "leftover problem" |
| Works Somehow | Options can advance the main line, but one carries a hidden risk |
| Main Character Moment | Options can be bolder; one "press the advantage" option |
| Iconic Roll | One "extend the legendary moment" option, lowest risk |

### 4.3 Timeout auto-play rule
- Each beat's ACTION_SELECT has a **30s soft timer** (UI shows a countdown bar).
- On timeout: the system auto-picks `actionOptions[0]` and marks `autoPlayed: true`.
- Auto-played beats appear in chat as `[{playerName} was auto-played]`, in a grey bubble.
- **Demo anti-crash:** if Call 2 also times out (no API), use fallback options and continue.

### 4.4 "Wrap it up" rule
- Any player can tap **"Wrap it up"** at the end of any beat.
- On trigger: every player in the current round takes one Final Roll (no new ACTION_SELECT, roll directly), then ENDING.
- Final Roll narration is from Call 3, but the prompt notes `"This is the FINAL ROLL — make it climactic."`.
- **Minimum-beat protection:** "Wrap it up" is hidden for the first 3 beats, to guarantee a minimum experience.

### 4.5 Fate Card activation (Demo version)
Demo pre-seeds Fate Cards, auto-activated by condition:

| triggerCondition | Activates |
|---|---|
| `next_beat` | immediately at the start of the next beat |
| `roll_under_10` | when this beat's roll < 10 |
| `round_2` | at the start of round 2 (after everyone has acted once) |
| `manual` | no auto-activation; manual trigger during the demo only |

On activation:
1. Pop a Fate Card notification bubble in chat (special style, with sender name).
2. Add the Fate Card to Call 2 and Call 3 prompt context.
3. Mark `applied: true`, never re-activate.

---

## 5. UI spec

### 5.1 Screens

| Screen | Phase | Core elements |
|---|---|---|
| ColdChat | COLD_CHAT | simulated Zymix group chat, "seen, no reply" + "Roll to revive" |
| Setup | SETUP | player name inputs (1–4) + confirm |
| ThemeSelect | THEME_SELECT | 4 theme cards + "AI random" |
| Opening | OPENING | role cards flip reveal + opening narration typewriter |
| Playing | PLAYING | chat bubble stream + dice button + action options + Fate Card notice + "Wrap it up" |
| Ending | ENDING | ending narration typewriter |
| QuestCard | QUEST_CARD | shareable card + highlights + share |
| FateCardPage | standalone | external friend submits Fate Card (Demo: shows pre-seeded cards) |

### 5.2 Playing layout

```
┌─────────────────────────────────────┐
│  [theme emoji] Theme Name    [⚙️]    │  ← top nav
│  Round 2 · Jamie's turn            │  ← status hint
├─────────────────────────────────────┤
│  [AI narration bubble]              │  ← grey, left, AI Game Master
│  "The fridge door swings open..."   │
│  [player bubble] Jamie              │  ← green, right (active player)
│  "I demand a forensic investigation"│
│  [dice result banner]               │  ← full-width, color = result
│  😅 Messy Progress · 7/20          │
│  [AI response bubble]               │
│  "Jamie slams the counter..."       │
│  [Fate Card notice bubble] 🃏       │  ← special, purple border
│  Sarah added: Food Metaphor Mode    │
├─────────────────────────────────────┤
│  ── Kai's turn ──                   │  ← divider, next player
│  [action option cards]              │
│  A. Blame the pigeon               │
│  B. Check the CCTV footage         │
│  C. Confess everything             │
│  [free input] Or say something...  │
│  [30s countdown bar]                │
│  [🎲 Roll]  [Wrap it up]           │  ← Roll active after choosing
└─────────────────────────────────────┘
```

### 5.3 Dice interaction
**Form:** Roll button + number-scramble animation + result card pop (combines approaches A+C).
1. After choosing an action, `🎲 Roll` goes grey→green (active).
2. On tap: button becomes a fast scrambling dice number (1–2s).
3. On end: a full-width result banner pops (number + label + emoji + color).
4. Banner holds ~1.5s, then Call 3 streaming narration begins.

**Banner colors:**

| Result | Background | Text |
|---|---|---|
| Total Chaos | `#EF4444` | `#FFFFFF` |
| Awkward Fail | `#F97316` | `#FFFFFF` |
| Messy Progress | `#EAB308` | `#1A1A1A` |
| Works Somehow | `#22C55E` | `#FFFFFF` |
| Main Character Moment | `#3B82F6` | `#FFFFFF` |
| Iconic Roll | `#8B5CF6` | `#FFFFFF` |

### 5.4 Zymix style
- **Background:** `#FFFFFF`
- **Primary accent:** `#1DB954` (Zymix green)
- **AI narration bubble:** `#F3F4F6` (light grey), left, no avatar
- **Player bubble:** `#1DB954` (green), right, white text
- **Other player bubbles:** that player's `color`, left
- **Font:** system (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Radius:** `12px` (bubbles), `16px` (cards)
- **Fate Card bubble:** `#EDE9FE` (light purple), `#7C3AED` border, left

---

## 6. Fallback & anti-crash

### 6.1 Three layers
```
Layer 1: JSON Schema constraint
  → validate every LLM output with a Zod schema
  → on failure → Layer 2
Layer 2: auto-retry
  → at most 1 retry per call (avoid long demo waits)
  → on failure → Layer 3
Layer 3: pre-generated fallback
  → fallback.ts pre-seeds full opening / actionOptions / narrations / ending / questCard per theme
  → fallback data passes the Zod schema (format guaranteed)
  → GLM_OFFLINE=true forces Layer 3
```

### 6.2 Fallback data requirements
`fallback.ts` must include:
- Full Call 1 output per theme (4): opening + roles + firstActionOptions
- A generic narration template per dice tier (6) × theme (4), with `{name}` and `{action}` placeholders
- Full Call 4 output per theme: endingNarration + questCard
- Generic action-option fallback: `["Investigate the situation", "Ask for help", "Try something unexpected"]`

---

## 7. Theme whitelist

| ID | Name | Emoji | Opening setup | Color |
|---|---|---|---|---|
| `flat-drama` | Flat Drama | 🏠 | Someone nicked food from the fridge. Who did it? | `#8B5CF6` |
| `love-island` | Love Island | 💘 | Tonight's Bombshell arrives. Who gets dumped? | `#F97316` |
| `last-train` | Last Train Home | 🚇 | Last tube's leaving. Someone's getting left behind. | `#0EA5E9` |
| `group-chat-trial` | Group Chat Trial | 💬 | That cursed message. Court is now in session. | `#1DB954` |

---

## 8. Degraded mode

| Players | Handling |
|---|---|
| 1 | AI fills 2 NPCs (`isAI: true`); their action + roll run automatically, no countdown |
| 2 | AI fills 1 NPC |
| 3–4 | normal, no NPC |

NPC action rule: pick a random one from `actionOptions`; roll result is truly random (no cheating).

---

## 9. Suggested file structure

```
lib/
  dice.ts          rollDice() → DiceRoll (pure, tested)
  schema.ts        all Zod schemas (Quest / Player / Beat / FateCard / QuestCard)
  fallback.ts      all fallback data (full dataset per theme)
  director.ts      all prompt builders (buildOpeningPrompt / buildActionPrompt / buildNarrationPrompt / buildEndingPrompt)
  questStore.ts    in-memory Quest state (shared by main game ↔ Fate Card page)
  glm.ts           GLM OpenAI-compatible client (networked, untested)
  env.ts           isOffline() reads GLM_OFFLINE
app/api/
  quest/route.ts       POST: create Quest (Call 1)
  action/route.ts      POST: generate action options (Call 2)
  roll/route.ts        POST: submit action + roll → narration (Call 3)
  ending/route.ts      POST: generate ending + Quest Card (Call 4)
  fate/route.ts        GET: fetch pending Fate Cards (Demo: pre-seeded)
app/
  page.tsx             main game state machine
  q/[id]/page.tsx      external friend Fate Card page
components/
  ColdChat.tsx / Setup.tsx / ThemeSelect.tsx / Opening.tsx / Playing.tsx
  DiceRoller.tsx / ActionOptions.tsx / FateCardBubble.tsx / QuestCard.tsx / MessageBubble.tsx
```

---

## 10. Demo data (must pre-seed)

Demo uses the `flat-drama` theme, 3 players: `Jamie`, `Kai`, `Mia`, plus a pre-seeded Fate Card `Food Metaphor Mode` (submitted by `Sarah (WhatsApp)`, triggers at `round_2`).

**Full Demo chain (the perfect run when `GLM_OFFLINE=true`):**

```
Opening: "The kitchen light flickers on at 2am. Three flatmates stand in a semicircle,
          staring at the empty shelf where Jamie's leftover pasta used to be.
          Someone ate it. Someone always does. Tonight, someone answers for it."

Roles:
  Jamie → The Forensic Foodie | "Can identify any meal by smell alone"
  Kai   → The Ghost Rogue     | "Suspiciously good at not being noticed"
  Mia   → The Chaos Bard      | "Turns every accusation into performance art"

Beat 1 (Jamie, Roll: 7 → Messy Progress):
  Action: "Demand a full forensic investigation"
  Narration: "Jamie slams their hand on the counter and announces a full investigation.
              The pasta evidence is found — but it's been microwaved beyond recognition.
              Kai quietly takes a step backward.
              Mia whispers: 'This is already better than the last flat meeting.'"

Beat 2 (Kai, Roll: 3 → Awkward Fail):
  Action: "Deny everything and blame the pigeon"
  Narration: "Kai's alibi involves a pigeon, a 3am craving, and a very specific timeline
              that somehow makes things worse. Nobody believes the pigeon theory.
              Jamie raises an eyebrow: 'There are no pigeons on the fourth floor, Kai.'"

[Fate Card activates: Food Metaphor Mode — Sarah (WhatsApp)]

Beat 3 (Mia, Roll: 18 → Main Character Moment):
  Action: "Deliver a closing argument in the style of a courtroom drama"
  Narration: "Mia rises, and in the language of Food Metaphor Mode, delivers the verdict:
              'The pasta was not stolen — it was emotionally consumed by someone who needed
              carbohydrate closure.' The room falls silent. Even the microwave seems moved.
              Kai slowly raises their hand."

Ending: "The Flat Drama concludes not with justice, but with a group decision to label
         everything in the fridge. Kai buys replacement pasta. Mia frames the verdict.
         Jamie installs a padlock. The chat, once silent, now has 47 unread messages."

QuestCard:
  title: "The Great Pasta Incident: Resolved"
  caption: "Chaotic but fed"
  highlights: ["Jamie's forensic slam", "Kai's pigeon alibi", "Mia's carbohydrate closure verdict"]
  bestInterferenceCaption: "Sarah's Food Metaphor Mode turned a flat argument into philosophy"
```

---

## 11. Verification checklist

Before submitting the Demo, all must pass:

- [ ] `GLM_OFFLINE=true` runs end-to-end: cold chat → 3 beats → Wrap it up → ending → Quest Card
- [ ] Fate Card activates correctly at `round_2`, appears in the chat stream
- [ ] Dice animation is smooth, banner color correct
- [ ] Timeout auto-play works (30s countdown → auto-picks actionOptions[0])
- [ ] Quest Card can be screenshotted/downloaded
- [ ] No white screen on any LLM failure; silently switches to fallback
- [ ] Fate Card page (`/q/[id]`) is independently reachable, shows pre-seeded cards
- [ ] Mobile (375px wide) layout is correct
```
