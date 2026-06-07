# Teammate-Driven Story Events — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)
**Area:** Roll Call branching game — `data/branchingStories.ts`, `lib/branchingEngine.ts`, `hooks/useGameState.ts`, `components/PlayingScreen.tsx`, `components/EndingCard.tsx`

## Problem

The teammate phase is currently theatre. Each round the human ("You") makes a real
branching choice, then three AI teammates auto-roll dice that only nudge the
`tension` meter by ~⅓ weight (`useGameState.ts:252`). The branch is routed
**solely** by You's `choiceIndex + roll` (`branchingEngine.ts:advance`). Result:
testers can't tell whether their choice mattered, the teammates read as filler,
and the assigned role/ability — the product's headline hook — pays off nowhere.

This product is fundamentally **multiplayer**; teammates are simulated by AI for
now. We want the teammate phase to **genuinely change the story**, not just the
meter — while keeping You as the protagonist spine.

## Goal

A teammate's action can **reroute the story**: a strong or disastrous teammate
roll triggers a **role-specific event** that overrides where the story goes next,
playing out as a real, written scene that rejoins the main line. This makes
teammates consequential and finally makes roles matter. The run then **closes the
loop on the ending card** — the result reflects who swung the night — so the whole
story reads as complete from cold-group ping to highlight card.

Two legibility fixes ship alongside the teammate events, because the same testers
who missed the teammate impact also couldn't read their own agency or the meter:

1. **Causal bridge line every turn** — after you roll, the DM says one line that
   spells out "your choice + your roll → what happened" *before* the next scene, so
   agency is visible (not just an unexplained scene jump).
2. **Goal chip** — a persistent `🎯 {story.goal}` chip in the header.
3. **Crisis meter** — the unexplained `tension` bar becomes a legible, story-named
   crisis meter (see "Crisis meter" below).

Non-goals (explicitly out of scope this pass):
- Real-multiplayer plumbing / network interfaces (simulation only for now).
- Redesigning the ending card's visual language or the invite/Fate-Card mockups.
  (We *extend* the ending card with event linkage — see "Ending card linkage" — but
  don't restyle it or wire up the invite flow.)
- Fully bespoke ending titles per `ending × event` combination.
- Teammates co-authoring the branch via their own choice menus.

## Decisions (from brainstorming)

| Axis | Decision |
|------|----------|
| How teammates affect the story | They trigger **independent event branches** (You stays the spine). |
| Trigger | **Dice + role**: a teammate's roll + their role decides which event, if any. |
| Effect | **Reroute** — the event overrides the next node. |
| Reroute target | **Dedicated event nodes** (approach B): each event is a full scene that rejoins, i.e. we *expand* the story. |
| Frequency | **High** — tuned so almost every run fires at least one event. |
| Event size | **Full beat**: one scene + 2 choices that rejoin the main line. |

## Mechanic

### Round loop (revised)

1. Show the current node's scene + a persistent `🎯 {story.goal}` chip in the header.
2. **Your turn:** pick a branch + roll → compute a *provisional* next node via the
   existing `advance(node, yourChoice, yourRoll)`.
3. **Teammates' turn:** the 3 AI teammates auto-roll (dice theatre kept). Across
   the three rolls, select **at most one** event for the round:
   - **Boon:** the teammate with the highest roll `>= 15` fires **their role's boon
     event**. (Boon takes priority over chaos.)
   - **Chaos:** else, the teammate with the lowest roll `<= 6` fires **their role's
     chaos event**.
   - **Neither:** the standout teammate posts one scene-relevant reaction line
     (drawn from `story.reactions`, not the generic `NPC_FLAVOR` noise). No reroute.
4. **DM resolves:** posts a **causal bridge line every turn — event or not** —
   spelling out your choice + roll → outcome ("You went in calm (14), and the room
   shifts your way"), and, when an event fired, who swung it ("…then Kai dropped a
   screenshot and it flipped"). *Then* the next scene. If an event fired, the next
   node is the **event target** (overriding the provisional node); otherwise the
   provisional node stands.

At most one event per round keeps pacing readable; a winning teammate swing feels
earned, not spammy. The causal bridge is what makes both your agency and the
teammate's swing legible instead of an unexplained scene jump.

### Trigger thresholds (tuned to `rollNPCValue()`)

NPC rolls are biased upward by 0–2 (`dice.ts:rollNPCValue`). With a boon threshold
of **≥15**, a single NPC fires with P≈0.35, so across 3 NPCs P≈0.725 per round,
and ≈0.99 across a ~4-round run — satisfying "almost every run fires an event".
Chaos at **≤6** is naturally rarer (the spicy minority). Thresholds live as named
constants and are tunable.

### Event resolution & rejoin

- A **boon event** routes to a **new dedicated event node** in `story.nodes`. The
  node is a normal `BranchNode` (scene + exactly 2 choices); its choices'
  `onSuccess`/`onFail` point back into the existing mid/late nodes or endings, so
  the story rejoins. Event nodes route toward bridge/late nodes (not directly to
  endings) so the existing `MIN_ROUNDS_BEFORE_ENDING` bridge logic still holds.
- A **chaos event** reuses an **existing unfavorable node** (e.g. `chaos`, `messy`,
  `spiral`, `trapped`) as its target — no new node, just a one-line chaos blurb.
- The human's choice still set the baseline; an event overrides it. This is the
  intended "teammates can flip the story" feel.

### Crisis meter (formerly `tension`)

The `tension` mechanic stays — it's the run's stakes — but becomes legible:

- **Story-named, not "Tension".** Each story names its meter and gives it an icon,
  e.g. `group-chat-trial` → "Group Chat Meltdown" 🔥, `ring-light-goes-dark` →
  "Cancel Meter" 📉, `honeycomb-escape` → "Room Reset" ⏱️, `two-texts-one-chat` →
  "Drama Meter" 💔.
- **Rules stated up front.** A one-line explainer near the meter: "Fails heat it up,
  wins cool it down — fill it and the night falls apart." Shown on first play / as
  meter subtext so the number isn't a mystery.
- **Every change is narrated.** When the meter moves a meaningful amount, a short
  "why" rides along with the causal bridge ("that misfire heated it up +7"), so
  players learn what drives it.
- **The collapse stays, but fair.** Hitting 100 still ends the run
  (`It All Fell Apart`), but now it's a communicated, earned loss — the meter was
  named, explained, and narrated all the way up. No silent, contradictory death.
- Math (`tierEffect`, weights, start 35) is unchanged this pass; only naming,
  explanation, and narration are added. (Re-tuning is a possible follow-up.)

### Ending card linkage

The ending card closes the loop on the teammate events so the whole run reads as
one complete story. **The ending copy itself varies with what happened**, kept
bounded (no per-`ending × event` combinatorial writing):

- **Run event log.** Every fired teammate event is recorded:
  `{ round, actorName, role, kind: 'boon'|'chaos', line, coda, fromNode, toNode }`.
- **Pivotal event.** A deterministic pick of the single most impactful event of the
  run: prefer a boon over a chaos; among ties, the latest one (closest to the
  ending it led into). Null if no event fired.
- **Epilogue coda.** The card's epilogue = the ending node's `scene` + (if a pivotal
  event exists) its `coda` appended as a closing beat ("…and it was Kai's screenshot
  that turned the whole thing"). One authored `coda` per event — bounded.
- **Dynamic headline tag.** A small badge derived from the pivotal event:
  boon → `✨ Saved by {actorName}`, chaos → `💀 {actorName} nearly sank it`, none →
  omitted. This is what makes the card's headline read differently per run without
  rewriting the ending's core `title`.
- **Turning points recap.** A compact list of all fired events this run
  (`🔀 {actorName} · {role} — {short line}`), so the journey is legible at the end.
- **MVP credit.** `best_interference` credits the teammate who swung the story
  (pivotal-event actor) alongside the existing crit/nat-1 stats.

The ending node's own `title`/`caption`/`tone` (the branch-tree outcome) are
unchanged — fully bespoke titles per event combination are out of scope (possible
follow-up). The dynamic tag + coda deliver the "ending reflects who saved/sank it"
feel at bounded cost.

## Data model

Add to `BranchingStory` in `data/branchingStories.ts`:

```ts
export interface RoleEvent {
  /** DM line announcing the event before the reroute. */
  line: string;
  /** Node or ending id to reroute to. */
  target: string;
  /** One-line lasting consequence, used on the ending card if this was the
   *  run's pivotal event (boon = triumphant, chaos = rueful). */
  coda: string;
}

export interface RoleEvents {
  boon: RoleEvent;
  chaos: RoleEvent;
}

// On BranchingStory:
roleEvents: Record<string /* member name */, RoleEvents>;
defaultRoleEvent: RoleEvents; // fallback for extra/unknown members
crisisMeter: { name: string; emoji: string }; // story-named tension meter
```

Plus the **new boon event nodes** added into each story's `nodes` map.

### Content to author

Per story, the 3 named teammates (e.g. Mia / Kai / Momo) each get **one boon event
node** + boon line + boon coda; chaos reuses an existing unfavorable node with one
line + chaos coda; the `defaultRoleEvent` covers extras. Totals: **4 stories × 3 =
12 new event scenes**, plus per event a `line` and a `coda` (≈24 lines + 24 codas
across boon/chaos), and 4 default fallbacks. Each new scene matches the existing
voice (UK Gen-Z, "chaotic but harmless", English copy) and the existing node shape
(2–3 sentence scene + 2 choices).

## Engine changes (`lib/branchingEngine.ts`)

Pure, testable helpers (no React, no network):

- `selectTeammateEvent(story, teammateRolls)` → `{ actorName, role, kind: 'boon'|'chaos', event } | null`.
  - `teammateRolls: Array<{ name: string; role: string; roll: number }>`.
  - Applies the boon-first, then-chaos selection rule with the thresholds above.
  - Resolves the member's `roleEvents[name]` (falling back to `defaultRoleEvent`).
- `advance(...)` gains an **optional event override**: when an event is selected
  for the round, the resolved next node is `event.target`; otherwise behaviour is
  unchanged. Existing single-arg callers keep working (override is optional).
- `pickPivotalEvent(eventLog)` → the run's most impactful event (boon > chaos, then
  latest) or null. Pure and deterministic, for the ending card.

## State / loop changes (`hooks/useGameState.ts`)

- Track this round's teammate rolls; when the last actor resolves, call
  `selectTeammateEvent` and stash a `pendingEvent` (the chosen event, or null).
- In `advanceStoryWithTeamResults`: if `pendingEvent` exists, post its `line` as a
  DM bubble, then route to `pendingEvent.target` (instead of the provisional node);
  else route as today. Reset `pendingEvent` each round.
- Replace the generic `NPC_FLAVOR` filler with scene-relevant reactions from
  `story.reactions` for the no-event case.
- Emit the **causal bridge line every turn** (event or not) as a DM bubble before
  the next scene, and surface a short "why" for any meaningful crisis-meter change.
- `tension` math is unchanged; only its presentation is upgraded (see UI changes).
- **Record fired events** into a run event log on state; at game end compute the
  pivotal event and pass log + pivotal + coda + headline tag into `questCard` so the
  ending card can render them (see "Ending card linkage").

## UI changes (`components/PlayingScreen.tsx`)

- Persistent `🎯 {story.goal}` chip in the header for legibility.
- Render the DM's event line + causal bridge line as normal DM narration bubbles
  (no new bubble type needed).
- Event nodes render through the existing node UI — they are ordinary nodes, so the
  choosing/rolling/resolving flow is unchanged.
- **Crisis meter:** relabel the meter from "Tension" to `{crisisMeter.emoji}
  {crisisMeter.name}`, add the one-line rules explainer as meter subtext, and show
  a brief "why" microcopy when it moves (e.g. "+7 — that misfire heated it up").
  Existing color/icon escalation (green → amber → red) is kept.

### Ending card (`components/EndingCard.tsx`)

- Extend the `card` shape with the run event log, pivotal event, and headline tag
  (all optional, so the card degrades gracefully when nothing fired).
- Render the **dynamic headline tag** (`✨ Saved by {actor}` / `💀 {actor} nearly
  sank it`) near the title badge; append the pivotal **coda** to the epilogue.
- Add a **"Turning points"** section listing the fired events, reusing the existing
  highlight/marks visual style (no new design language).

## Testing (TDD)

Engine logic is pure → unit-tested first (`tests/branchingStories.test.ts` or a new
`tests/branchingEvents.test.ts`):

- `selectTeammateEvent`: boon fires at ≥15; chaos at ≤6; boon beats chaos; highest
  (boon) / lowest (chaos) teammate is chosen; none in the dead zone → null;
  unknown member → `defaultRoleEvent`.
- `advance` with override returns `event.target`; without override, unchanged.
- `pickPivotalEvent(eventLog)`: boon beats chaos; among same kind, the latest wins;
  empty log → null. (Pure, deterministic — no `Math.random`.)
- **Data integrity (all 4 stories):** every `roleEvents[*].{boon,chaos}.target` and
  every event node's choice targets resolve to a real node or ending in the same
  story (no dangling ids); every named teammate has a `roleEvents` entry; each
  `roleEvents[*].{boon,chaos}` has a non-empty `line` and `coda`; each story has a
  non-empty `crisisMeter.name`.

## Risks / mitigations

- **Reroute incoherence:** mitigated by dedicated boon event nodes written to read
  naturally as a reroute, and chaos targeting genuinely unfavorable existing nodes.
- **Your choice feeling moot:** at most one event/round, and the DM bridge line
  explicitly credits both your move and the teammate swing, so it reads as a
  collaborative turn, not a hijack.
- **Concurrent edits:** another agent edits this repo live; re-check file state
  immediately before each edit.

## Out of scope (future)

Real-multiplayer interface, tension-system rework, making chaos events also spawn
dedicated nodes, and wiring the invite/Fate-Card flow to real gameplay.
