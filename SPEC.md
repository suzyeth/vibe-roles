# Vibe Roles — Engineering Spec (SPEC v2.0)

> Single implementation reference for engineers. Product rationale & scenarios: DESIGN.md (this spec follows the latest DESIGN). Architecture/status: PLAN.md.
> Last updated: 2026-06-06

## 0. Positioning (engineer version)
**Vibe Roles is a ZYMIX-native cold-group-revival mini game.** A group that's been quiet ~72h shows a light in-chat prompt; one tap starts an AI-generated, DND-like adventure. The AI generates the story & roles **randomly, without reading chat history**, then maintains a persistent **story_state**: every action + D20 roll produces a lasting consequence that affects later beats and the relationships between characters. External friends can add ONE intervention via a **5-minute disappearing invite**. The run ends with a shareable card.

Hard product constraints (must hold in code):
- **Never read chat history.** Generation inputs: inactivity flag + member count + member names + ~3-min budget only.
- **Consequences persist.** Each roll writes ≥1 entry into `story_state`.
- **English only**, PG-safe, theme whitelist.
- **Never crash the demo.** `GLM_OFFLINE=true` forces the full fallback path; every route falls back; all GLM output is Zod-validated.

---

## 1. State machine

```
COLD_PROMPT     in-chat light prompt after ~72h inactivity (persistent, non-blocking)
  ↓ any member taps "Start the adventure"
OPENING         Call 1: random story + roles + first-round options (one structured call)
  ↓ opening revealed (role name shown under each avatar)
PLAYING         beat loop (see 1.1)
  ↓ "Wrap it up" (after a minimum) OR beat cap
ENDING          Call 4: ending narration + share-card copy
  ↓
SHARE_CARD      ending card shown + share
```

### 1.1 PLAYING sub-loop (per beat)
```
BEAT_NARRATE     AI narrates the current situation (typewriter)
  ↓
ACTION_SELECT    active player taps one of 2–3 AI options OR types a custom action (30s soft timer → auto-pick option[0])
  ↓
DICE_ROLLING     D20 roll animation
  ↓
RESOLVE          Call 2: narrate the outcome of THAT action at the rolled tier + record ≥1 consequence into story_state
  ↓
STATE_UPDATE     merge consequence into story_state (clues / locations / character status / relationships); recompute next options
  ↓ next actor → BEAT_NARRATE   |   wrap up → ENDING
```
External interventions can arrive at any time (5-min invite) and are woven in at the next suitable beat.

---

## 2. Data structures (TypeScript)

```typescript
type DiceResult =
  | "critical-fail"        // 1
  | "fail"                 // 2–5
  | "partial-progress"     // 6–10
  | "success"              // 11–15
  | "strong-success"       // 16–19
  | "critical-success";    // 20

interface DiceRoll { value: number; result: DiceResult; label: string; emoji: string; color: string; }

interface Player {
  id: string;
  name: string;            // existing group member name (not entered by user)
  role: string;            // story-relevant, generated this run (shown under avatar)
  ability: string;
  status: "active" | "sleeping_npc" | "npc";
  inventory: string[];
  trust: Record<string, number>; // playerName -> -2..+2
}

interface Beat {
  round: number;
  actor: string;           // player name
  action: string;          // chosen option or free-typed
  autoPlayed: boolean;
  roll: DiceRoll;
  rollLabel: string;
  consequence: string;     // the lasting effect written to story_state
}

interface StoryState {
  known_clues: string[];
  location_status: Record<string, string>;
  character_status: Record<string, string>;
  relationships: string[];
  active_consequences: string[];
}

type InterventionType = "event" | "message" | "character" | "object" | "rule" | "condition";

interface Intervention {
  source_friend: string;       // e.g. "Maya (WhatsApp)"
  type: InterventionType;
  title: string;
  effect: string;
  trigger: "next_round" | "later";
  expires_after_minutes: 5;
  visibility: "disappearing_invitation";
  applied: boolean;
}

interface Quest {
  id: string;
  source: "zymix_group_chat";
  status: "playing" | "ending" | "ended";
  generation: { mode: "random_story_generation"; uses_chat_history: false; trigger: "group_inactive_72_hours"; member_count: number; theme: string; role_generation_mode: "random_but_story_relevant" };
  scene: { theme: string; setup: string; tone: string };
  players: Player[];
  story_state: StoryState;
  rounds: Beat[];
  external_interventions: Intervention[];
  ending: string;
  share_card: ShareCard | null;
}

interface ShareCard { title: string; caption: string; best_interference: string; cta: string; }
```
(Full populated example: DESIGN.md §9.4.)

---

## 3. AI calls

| Call | When | Input | Output | Streaming |
|---|---|---|---|---|
| Call 1 | OPENING | member count + names + theme (NO chat history) | scene + roles + firstActionOptions | JSON |
| Call 2 | RESOLVE | action + dice tier + story_state + pending interventions | narration + ≥1 consequence + next options | JSON (narration may stream) |
| Call 3 | friend submits | friend input + type | structured Intervention | JSON |
| Call 4 | ENDING | rounds summary + story_state + best roll/intervention | ending + share_card | JSON (may stream) |

### 3.1 Call 1 (opening, no chat history)
```
You are the AI Game Master for Vibe Roles. Randomly generate a 3-minute group adventure. DO NOT use or assume any chat history.
INPUT: members = {names}; theme = {theme or "random from safe pool"}; member_count = {n}.
Output JSON ONLY:
{"scene":{"theme":"...","setup":"2-3 vivid sentences, a crisis/mystery","tone":"chaotic, playful, safe"},
 "players":[{"name":"<member name>","role":"story-relevant role","ability":"one line","status":"active"}],
 "firstActionOptions":["2-3 concrete options for the first actor"]}
Rules: one role per member, tied to the crisis; English; Gen Z; PG-safe; theme from the safe whitelist only.
```

### 3.2 Call 2 (resolve action + advance story_state)
```
You are the GM. Narrate the OUTCOME of the action at the dice tier, then record the lasting consequence.
ACTOR: {name} ({role}); ACTION: "{action}"; DICE: {value}/20 — {label}.
STORY STATE: clues={known_clues}; locations={location_status}; characters={character_status}; relationships={relationships}.
PENDING INTERVENTIONS: {interventions or none}.
TIER GUIDE: Critical Fail(1) severe-but-safe; Fail(2-5) fails, more complex; Partial Progress(6-10) progress with a cost; Success(11-15) succeed + clue/scene change; Strong Success(16-19) succeed + advantage affecting others; Critical Success(20) highlight/twist.
Output JSON ONLY:
{"narration":"2-3 vivid sentences reacting to THIS action at THIS tier; weave any intervention; end on a hook",
 "consequence":"one lasting effect to store (clue/location/status/relationship)",
 "story_state_updates":{"known_clues":[],"location_status":{},"character_status":{},"relationships":[]},
 "nextActionOptions":["2-3 options for the next actor, escalating from this result"]}
```

### 3.3 Call 3 (friend input → structured intervention)
```
Turn a friend's one-line input into a structured intervention. Output JSON ONLY:
{"type":"event|message|character|object|rule|condition","title":"<=6 words","effect":"one line","trigger":"next_round|later"}
Rules: type fits the input; safe, fun, weaveable; filter violence/explicit/hate/personal attacks.
```

### 3.4 Call 4 (ending + share card)
```
Write the ending and the share card. Reference what actually happened (rounds + story_state). Output JSON ONLY:
{"ending":"3-5 sentence twist ending, resolve the crisis, end on a high note",
 "share_card":{"title":"punchy title","caption":"<=5 words mood","best_interference":"best intervention title or 'pure chaos within'","cta":"Start your own Vibe Roles on Zymix"}}
```
Every call has a fallback (§6) and Zod validation.

---

## 4. Turn & story rules
- **Player order:** round-robin over `players` by join order; role name shown under each avatar.
- **Consequence rule (core):** every RESOLVE must write ≥1 entry into `story_state`. The next beat's options/narration MUST reflect current `story_state` (clues, relationships, locked/open locations, suspicions).
- **Cross-effects:** one player's result changes others' situation (open a door → others can enter; trip an alarm → everyone more endangered; gain a clue pointing at another player; a custom action that sets a rule binds everyone after).
- **30s soft timer** in ACTION_SELECT → auto-pick option[0], mark `autoPlayed`, grey bubble.
- **Wrap it up:** available after a minimum number of beats → each remaining player takes one Final Roll → ENDING.

---

## 5. External intervention (5-minute disappearing invite)
- Share generates a **5-minute** invite. Friend sees only the current story situation (never the chat).
- Friend adds ONE factor of a whitelisted type:

| Type | Example | Effect |
|---|---|---|
| Event | An alarm blares | Change the situation |
| Message | An anonymous text | New info |
| Character | The 404th customer appears | Add an NPC |
| Object | A key that opens no door | Give an item |
| Rule | Doors auto-lock when someone lies | Change a world rule |
| Condition | Leave the room within 5 minutes | Add a constraint |

- AI (Call 3) decides type/strength/trigger/relationship impact — friends never edit the story directly. "Friends provide chaos; the AI governs it."
- **Disappearing behavior:** after 5 min the invite vanishes from view. In-app: the invite card disappears from chat. External (WhatsApp etc.): demo simulates "This invitation has disappeared". Store `expires_after_minutes: 5`, `visibility: "disappearing_invitation"`.
- **Intervener reward:** after the run, the friend can see the ending summary, which round their intervention hit, its impact, and an "intervention contribution card".

---

## 6. Fallback & anti-crash (3 layers)
1. Zod schema validation on every call output.
2. ≤1 retry per call.
3. Pre-generated fallback per theme (opening + per-tier narration with {name}/{action} + ending + share_card) + mock interventions. `GLM_OFFLINE=true` forces layer 3. Fallback output must pass its Zod schema.

---

## 7. Theme whitelist (random safe pool)
Stories are drawn from a safe pool, e.g.: **The 404 Customer** (convenience-store loop), Space-station oxygen failure, Lost at Tube platform 404, Dorm-kitchen mystery order, Party "text from the future". Each: id, label, emoji, setup, color. Roles are generated per run, tied to the crisis (not a fixed job list).

---

## 8. Degraded modes
| Players | Handling |
|---|---|
| 1 | Solo Quest + 2 NPCs (`isAI`/npc); NPC acts & rolls automatically, no countdown |
| 2 | +1 NPC disruptor |
| 3+ | normal |
Offline/non-responding members → **Sleeping NPC**; can **Re-enter the quest**. NPC action: random from options; roll is truly random.

---

## 9. UI screens
| Screen | Phase | Core |
|---|---|---|
| ColdPrompt | COLD_PROMPT | in-chat light prompt (pinned/after last msg), non-blocking, "Start the adventure" |
| Opening | OPENING | role reveal (role name under avatar) + opening narration |
| Playing | PLAYING | chat stream + dice (D20 scramble → result banner, §4.1 colors) + action option cards + free-input box + intervention bubble (purple) + share + Wrap it up |
| InterventionPage | standalone `/q/[id]` | friend sees only the story situation + a type picker + one-line input + **5-min countdown**; after expiry shows "This invitation has disappeared" |
| EndingCard | SHARE_CARD | shareable card (title/caption/best moment/pivotal roll/best intervention/mood) + save/share |

Result-banner colors (DESIGN §4.1 tiers): Critical Fail `#EF4444` · Fail `#F97316` · Partial Progress `#EAB308` (dark text) · Success `#22C55E` · Strong Success `#3B82F6` · Critical Success `#8B5CF6`. Avatar/player bubbles per ZYMIX style.

---

## 10. Demo data (must pre-seed; the perfect `GLM_OFFLINE=true` run)
Theme **The 404 Customer**. Players: **Luna** (Delivery Driver), **Jake** (Lost Student), **Kai** (Store Manager), **Alex** (Investigator), **Emma** (CCTV Operator). Pre-seeded external intervention: **"Future Self Text"** (type message; submitted by Maya (WhatsApp); trigger next_round; 5-min disappearing).
Key beat: Kai "photograph the video" → D20=15 Success → consequence "Kai has seen this clip 72 times; others' trust in Kai shifts." Ending: "the group escapes by finding which future message was lying." Card: "Customer #404 · chaotic but alive again · best intervention: Future Self Text".

---

## 11. Verification checklist
- [ ] `GLM_OFFLINE=true` end-to-end: cold prompt → opening + roles → ≥3 beats with consequences in story_state → external intervention woven in → ending → share card
- [ ] Generation never reads chat history (inputs limited to names/count/theme)
- [ ] Each roll writes ≥1 story_state consequence; next options reflect it
- [ ] D20 banner labels/colors per §4.1; role name under each avatar
- [ ] 5-min invite shows countdown and the "disappeared" state; `/q/[id]` shows only the story situation
- [ ] 30s auto-play; Sleeping NPC / solo mode
- [ ] No white screen on any LLM failure (silent fallback)
- [ ] Ending card downloadable; mobile 375px ok
- [ ] All in-product text English
