# Teammate-Driven Story Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AI teammates genuinely change the branching story — a strong/weak teammate roll triggers a role-specific event that reroutes the plot — plus make agency, stakes, and the ending legible (causal bridge line, goal chip, named crisis meter, ending-card event recap).

**Architecture:** Keep "You" as the branch spine. Pure engine helpers (`selectTeammateEvent`, `pickPivotalEvent`, `advance` override) decide events from teammate rolls; the game-state hook records an event log, posts a causal bridge line every turn, reroutes on a fired event, and feeds the log into the ending card. New per-story data (`roleEvents`, `crisisMeter`, `goalShort`, boon event nodes) drives it all.

**Tech Stack:** Next.js + React (client hook), TypeScript (strict), Vitest (node env, `@` alias → repo root), Tailwind + CSS tokens.

**Note on commits:** Each task ends with a commit step per house TDD style. The repo is currently on `master` with unrelated in-flight changes from a concurrent editor — when executing, the user controls whether/when to actually commit; if committing, `git add` only the files this plan touches, never `git add -A`.

---

## File Structure

| File | Responsibility | Change |
|------|----------------|--------|
| `data/branchingStories.ts` | Story data + types | Add `RoleEvent`/`RoleEvents` interfaces, `roleEvents`/`defaultRoleEvent`/`crisisMeter`/`goalShort` fields, and 12 boon event nodes (3 per story) |
| `lib/branchingEngine.ts` | Pure traversal | Add `selectTeammateEvent`, `pickPivotalEvent`, `LoggedEvent`/`SelectedTeammateEvent` types; extend `advance` with optional event override |
| `tests/branchingEvents.test.ts` | Engine + data tests | New file |
| `hooks/useGameState.ts` | Game loop | Event log state, teammate-event selection at advance, causal bridge line, reroute, crisis-meter delta, ending-card payload |
| `components/PlayingScreen.tsx` | Play UI | Goal chip, crisis-meter relabel + explainer + delta microcopy, scene-relevant reactions |
| `components/EndingCard.tsx` | Ending UI | Dynamic "Saved/Sank by" tag, pivotal coda in epilogue, Turning Points recap |

---

## Task 1: Story data — types, fields, and event nodes

**Files:**
- Modify: `data/branchingStories.ts`
- Test: `tests/branchingEvents.test.ts` (create)

- [ ] **Step 1: Write the failing data-integrity test**

Create `tests/branchingEvents.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { BRANCHING_STORIES } from '@/data/branchingStories';

const TEAMMATES = ['Mia', 'Kai', 'Momo'];

describe('story event data integrity', () => {
  for (const story of BRANCHING_STORIES) {
    describe(story.key, () => {
      it('has a named crisis meter and short goal', () => {
        expect(story.crisisMeter?.name?.length).toBeGreaterThan(0);
        expect(story.crisisMeter?.emoji?.length).toBeGreaterThan(0);
        expect(story.goalShort?.length).toBeGreaterThan(0);
      });

      it('has roleEvents for every teammate plus a default', () => {
        for (const name of TEAMMATES) {
          expect(story.roleEvents[name], `${name} roleEvents`).toBeTruthy();
        }
        expect(story.defaultRoleEvent).toBeTruthy();
      });

      it('every event has non-empty line + coda and a resolvable target', () => {
        const ids = new Set([
          ...Object.keys(story.nodes),
          ...Object.keys(story.endings),
        ]);
        const all = [
          ...Object.values(story.roleEvents),
          story.defaultRoleEvent,
        ];
        for (const re of all) {
          for (const ev of [re.boon, re.chaos]) {
            expect(ev.line.length).toBeGreaterThan(0);
            expect(ev.coda.length).toBeGreaterThan(0);
            expect(ids.has(ev.target), `target ${ev.target}`).toBe(true);
          }
        }
      });

      it('every event node choice points to a real node or ending', () => {
        const ids = new Set([
          ...Object.keys(story.nodes),
          ...Object.keys(story.endings),
        ]);
        for (const node of Object.values(story.nodes)) {
          for (const c of node.choices) {
            expect(ids.has(c.onSuccess), `${node.id}.onSuccess ${c.onSuccess}`).toBe(true);
            expect(ids.has(c.onFail), `${node.id}.onFail ${c.onFail}`).toBe(true);
          }
        }
      });
    });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/branchingEvents.test.ts`
Expected: FAIL — `story.crisisMeter` / `story.roleEvents` are `undefined`.

- [ ] **Step 3: Add the interfaces and the three required fields to `BranchingStory`**

In `data/branchingStories.ts`, after the `BranchChoice` interface (around line 31), add:

```ts
export interface RoleEvent {
  /** DM line announcing the event before the reroute. */
  line: string;
  /** Node or ending id to reroute to. */
  target: string;
  /** One-line lasting consequence, shown on the ending card if this was the
   *  run's pivotal event (boon = triumphant, chaos = rueful). */
  coda: string;
}

export interface RoleEvents {
  boon: RoleEvent;
  chaos: RoleEvent;
}
```

In the `BranchingStory` interface, add these three members (next to `cta`):

```ts
  /** Short goal text for the persistent header chip (full text stays in `goal`/`intro`). */
  goalShort: string;
  /** Story-named tension meter shown during play. */
  crisisMeter: { name: string; emoji: string };
  /** Teammate role events keyed by member name; a strong/weak roll fires one. */
  roleEvents: Record<string, RoleEvents>;
  /** Fallback role event for members without a named entry. */
  defaultRoleEvent: RoleEvents;
```

- [ ] **Step 4: Add data + event nodes to Story 1 (`group-chat-trial`)**

Add the three new nodes to story 1's `nodes` map (after `bridge_fizzle`):

```ts
      kai_receipt: {
        id: "kai_receipt",
        scene:
          "Kai pastes the original, uncropped screenshot — timestamps, sender, the lot — straight from a folder literally named 'evidence'. The chat goes dead silent as everyone does the maths. The leaker's story just fell apart in real time.",
        choices: [
          { label: "Let the receipts speak", emoji: "🧾", onSuccess: "corner", onFail: "bridge_cleared" },
          { label: "Add your own caption", emoji: "✍️", onSuccess: "bridge_cleared", onFail: "chaos" },
        ],
      },
      mia_meltdown: {
        id: "mia_meltdown",
        scene:
          "Mia's tear-streaked Story hits 300 views in a minute and the comments pivot hard — sympathy, outrage at the leaker, a meme already forming. The narrative is suddenly yours to lose.",
        choices: [
          { label: "Ride the sympathy wave", emoji: "🌊", onSuccess: "bridge_cleared", onFail: "messy" },
          { label: "Redirect it at the leaker", emoji: "🎯", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      momo_truce: {
        id: "momo_truce",
        scene:
          "Momo's billionth 'guys, can we actually not' lands for once — the all-caps stops, people put their phones down for a second. In the lull, the leaker looks rattled and exposed.",
        choices: [
          { label: "Use the calm to corner them", emoji: "🕊️", onSuccess: "corner", onFail: "bridge_truce" },
          { label: "Call for a clean vote", emoji: "🗳️", onSuccess: "bridge_cleared", onFail: "chaos" },
        ],
      },
```

Add these fields to story 1 (next to its `cta`):

```ts
    goalShort: "Clear your name & unmask the leaker",
    crisisMeter: { name: "Group Chat Meltdown", emoji: "🔥" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai drops a screenshot from a folder literally named 'evidence' — the timestamps don't lie.", target: "kai_receipt", coda: "And in the end it was Kai's receipts folder that cleared your name." },
        chaos: { line: "Kai pastes the WRONG screenshot — your pettiest drafts — and the chat inhales.", target: "messy", coda: "And it was Kai fumbling the wrong screenshot that nearly buried you." },
      },
      Mia: {
        boon: { line: "Mia bursts into tears on camera and posts it to her Story — somehow the whole year group is on your side now.", target: "mia_meltdown", coda: "And it was Mia's on-cue breakdown, filmed in 4K, that turned the crowd." },
        chaos: { line: "Mia's 'storytime' goes off-script and names three innocent people; it's chaos now.", target: "chaos", coda: "And it was Mia's off-script storytime that nearly torched it." },
      },
      Momo: {
        boon: { line: "Momo types one 'guys, can we actually not' that — miraculously — everyone listens to.", target: "momo_truce", coda: "And somehow it was Momo's billionth 'can we not' that finally landed." },
        chaos: { line: "Momo tries to mediate and accidentally confirms the worst version of events.", target: "messy", coda: "And it was Momo's peacemaking that accidentally lit the fuse." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "A quiet lurker finally types — and drops exactly the receipt you needed.", target: "kai_receipt", coda: "And it was the quiet one who turned out to have the receipts." },
      chaos: { line: "A lurker screenshots everything to another chat and the mess doubles.", target: "chaos", coda: "And it was a silent lurker who quietly made it all worse." },
    },
```

- [ ] **Step 5: Add data + event nodes to Story 2 (`ring-light-goes-dark`)**

Add to story 2's `nodes` (after `bridge_smaller`):

```ts
      kai_cut: {
        id: "kai_cut",
        scene:
          "Kai drops the unedited raw file side-by-side with the 'leak' — the splice is obvious, the receipts undeniable. The tea pages start quietly deleting.",
        choices: [
          { label: "Post the side-by-side", emoji: "🧾", onSuccess: "bridge_uncancelled", onFail: "corner" },
          { label: "Save it, soft-launch instead", emoji: "🚀", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      mia_live: {
        id: "mia_live",
        scene:
          "Mia's unscripted live peaks — raw, messy, weirdly endearing — and the sentiment flips in real time. Forty thousand are watching her be human.",
        choices: [
          { label: "Pin the apology, ride it", emoji: "📌", onSuccess: "bridge_comeback", onFail: "messy" },
          { label: "Announce a charity stream", emoji: "💚", onSuccess: "bridge_uncancelled", onFail: "chaos" },
        ],
      },
      momo_cheque: {
        id: "momo_cheque",
        scene:
          "Momo posts a calm, corporate 'we stand by our creator' — and suddenly the brand's exit becomes a vote of confidence. The other sponsors un-mute.",
        choices: [
          { label: "Sign it live", emoji: "🧾", onSuccess: "bridge_uncancelled", onFail: "corner" },
          { label: "Leverage it for a bigger deal", emoji: "📈", onSuccess: "bridge_comeback", onFail: "chaos" },
        ],
      },
```

Add fields to story 2 (next to its `cta`):

```ts
    goalShort: "Save the channel before brunch cancels it",
    crisisMeter: { name: "Cancel Meter", emoji: "📉" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai digs up the raw timeline and finds the clip that proves the 'leak' was edited.", target: "kai_cut", coda: "And it was Kai, who knows where every cut is buried, who proved the leak was faked." },
        chaos: { line: "Kai accidentally uploads the bloopers reel — the mean outtakes — to the main.", target: "messy", coda: "And it was Kai posting the cursed bloopers that deepened the hole." },
      },
      Mia: {
        boon: { line: "Mia goes live, cries and contours simultaneously, and the comments melt.", target: "mia_live", coda: "And it was Mia crying in HD that brought the followers back." },
        chaos: { line: "Mia subtweets the brand mid-meltdown and the cheque visibly trembles.", target: "chaos", coda: "And it was Mia's subtweet that nearly cancelled it for good." },
      },
      Momo: {
        boon: { line: "Momo, still holding the cheque, publicly re-confirms the deal — on camera.", target: "momo_cheque", coda: "And it was Momo keeping the cheque on the table that saved the channel." },
        chaos: { line: "Momo forwards the brand's exit email to the wrong chat. Oops.", target: "chaos", coda: "And it was Momo leaking the exit email that spiked the panic." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "Even a hater turns — posts an 'okay this was actually fine' that resets the room.", target: "kai_cut", coda: "And it was a reformed hater whose comment turned the tide." },
      chaos: { line: "A hater pins a brutal supercut and it spreads.", target: "chaos", coda: "And it was one hater's supercut that nearly sank it." },
    },
```

- [ ] **Step 6: Add data + event nodes to Story 3 (`honeycomb-escape`)**

Add to story 3's `nodes` (after `bridge_stuck`):

```ts
      kai_lock: {
        id: "kai_lock",
        scene:
          "Kai lines up the symbols nobody else noticed and the bolt thunks back. A door you hadn't seen swings inward onto a cold service corridor.",
        choices: [
          { label: "Follow the corridor out", emoji: "🚪", onSuccess: "bridge_out", onFail: "keys" },
          { label: "Grab the master keys first", emoji: "🗝️", onSuccess: "keys", onFail: "loop" },
        ],
      },
      mia_hears: {
        id: "mia_hears",
        scene:
          "Everyone shuts up. Under the fake countdown there's traffic — a bus, real rain, the outside world right behind a painted-over panel.",
        choices: [
          { label: "Break through the panel", emoji: "🧱", onSuccess: "bridge_out", onFail: "loop" },
          { label: "Find the seam and pry it", emoji: "💨", onSuccess: "keys", onFail: "trapped" },
        ],
      },
      momo_torch: {
        id: "momo_torch",
        scene:
          "The dying torch beam glints off a recessed hatch in the floor, half under the rug. It wasn't there last loop. It's there now.",
        choices: [
          { label: "Drop through the hatch", emoji: "🌀", onSuccess: "bridge_out", onFail: "loop" },
          { label: "Check it for a trick first", emoji: "🔦", onSuccess: "keys", onFail: "trapped" },
        ],
      },
```

Add fields to story 3 (next to its `cta`):

```ts
    goalShort: "Find the real exit before the room resets",
    crisisMeter: { name: "Room Reset", emoji: "⏱️" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai goes quiet, then clicks the impossible lock open on the first real try.", target: "kai_lock", coda: "And it was Kai cracking the master lock that got everyone out." },
        chaos: { line: "Kai over-thinks the lock, re-enters the code, and the room resets around you.", target: "loop", coda: "And it was Kai outsmarting himself that triggered another reset." },
      },
      Mia: {
        boon: { line: "Mia freezes — 'shut UP, listen' — and points at the one wall with traffic behind it.", target: "mia_hears", coda: "And it was Mia hearing the night bus through the wall that found the way out." },
        chaos: { line: "Mia screams and knocks the candle — the only clue — into the dark.", target: "trapped", coda: "And it was Mia's scream that cost you the one clue." },
      },
      Momo: {
        boon: { line: "Momo spends the final 4% of battery on one sweep — and the torch catches a hatch.", target: "momo_torch", coda: "And it was Momo's last 4% of phone battery that lit the way out." },
        chaos: { line: "Momo's phone dies mid-step and you lose the way back in the black.", target: "loop", coda: "And it was Momo's battery dying at 0% that lost you the path." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "The one who wandered off reappears — already one room ahead, holding the way out.", target: "kai_lock", coda: "And it was the wanderer, always one room ahead, who'd already found the exit." },
      chaos: { line: "Someone wanders off again and the door re-locks behind them.", target: "loop", coda: "And it was the wanderer vanishing again that reset the whole thing." },
    },
```

- [ ] **Step 7: Add data + event nodes to Story 4 (`two-texts-one-chat`)**

Add to story 4's `nodes` (after `bridge_complicated`):

```ts
      kai_replies: {
        id: "kai_replies",
        scene:
          "Three dots from Kai, for a long time. Then a paragraph — genuinely, no 'haha' in sight. The whole chat holds its breath.",
        choices: [
          { label: "Answer it honestly", emoji: "💗", onSuccess: "bridge_official", onFail: "triangle" },
          { label: "Take it to DMs", emoji: "📩", onSuccess: "close", onFail: "spiral" },
        ],
      },
      mia_blessing: {
        id: "mia_blessing",
        scene:
          "Mia's 'honestly? good for them x' lands with zero shade, and the chat exhales. The triangle just lost a corner — cleanly, kindly.",
        choices: [
          { label: "Thank her, move forward", emoji: "🕊️", onSuccess: "bridge_official", onFail: "close" },
          { label: "Make the move now", emoji: "💘", onSuccess: "close", onFail: "triangle" },
        ],
      },
      momo_wingman: {
        id: "momo_wingman",
        scene:
          "Momo slides you a one-line script and a 'trust me'. It's perfect — the kind of thing only someone who's known you for years could write.",
        choices: [
          { label: "Send it word for word", emoji: "💌", onSuccess: "bridge_official", onFail: "close" },
          { label: "Make it your own", emoji: "✍️", onSuccess: "close", onFail: "triangle" },
        ],
      },
```

Add fields to story 4 (next to its `cta`):

```ts
    goalShort: "Survive the triangle, keep the friendship",
    crisisMeter: { name: "Drama Meter", emoji: "💔" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai — who only ever sends 'haha' — types a full, terrifying, real sentence.", target: "kai_replies", coda: "And it was Kai breaking the 'haha' streak with actual words that made it real." },
        chaos: { line: "Kai replies 'haha' to your feelings. Just 'haha'. The spiral begins.", target: "spiral", coda: "And it was Kai's single 'haha' that sent it all spiralling." },
      },
      Mia: {
        boon: { line: "Mia, the ex, posts 'honestly? good for them x' — and means it.", target: "mia_blessing", coda: "And it was the ex's blessing that cleared the runway." },
        chaos: { line: "Mia, the ex, screenshots it to her own chat and the triangle grows a corner.", target: "triangle", coda: "And it was the ex's screenshot that widened the triangle." },
      },
      Momo: {
        boon: { line: "Momo, who knew before you did, quietly tells you exactly what to say.", target: "momo_wingman", coda: "And it was Momo, who knew all along, who wingmanned it home." },
        chaos: { line: "Momo accidentally tells the wrong person, and now everyone knows.", target: "spiral", coda: "And it was Momo's slip that made it everyone's business." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "The witness, popcorn down for once, says the one true thing that helps.", target: "kai_replies", coda: "And it was the quiet witness who finally said the useful thing." },
      chaos: { line: "The witness narrates the whole thing to another chat, live.", target: "triangle", coda: "And it was the witness live-tweeting it that blew it up." },
    },
```

- [ ] **Step 8: Run the integrity test to verify it passes**

Run: `npx vitest run tests/branchingEvents.test.ts`
Expected: PASS (all 4 stories).

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add data/branchingStories.ts tests/branchingEvents.test.ts
git commit -m "feat(data): role events, crisis meters, short goals + 12 event nodes"
```

---

## Task 2: Engine — `selectTeammateEvent`

**Files:**
- Modify: `lib/branchingEngine.ts`
- Test: `tests/branchingEvents.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/branchingEvents.test.ts`:

```ts
import { selectTeammateEvent } from '@/lib/branchingEngine';
import { pickBranchingStory } from '@/lib/branchingEngine';

describe('selectTeammateEvent', () => {
  const story = pickBranchingStory('group-chat-trial');
  const roll = (name: string, role: string, roll: number) => ({ name, role, roll });

  it('fires a boon for the highest roll >= 15', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 16), roll('Mia', 'y', 8)]);
    expect(sel?.kind).toBe('boon');
    expect(sel?.actorName).toBe('Kai');
    expect(sel?.event.target).toBe('kai_receipt');
  });

  it('picks the highest among multiple boons', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 15), roll('Mia', 'y', 19)]);
    expect(sel?.actorName).toBe('Mia');
  });

  it('fires a chaos for the lowest roll <= 6 when no boon', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 9), roll('Momo', 'y', 3)]);
    expect(sel?.kind).toBe('chaos');
    expect(sel?.actorName).toBe('Momo');
  });

  it('prefers boon over chaos in the same round', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 17), roll('Mia', 'y', 1)]);
    expect(sel?.kind).toBe('boon');
  });

  it('returns null in the dead zone (7..14)', () => {
    expect(selectTeammateEvent(story, [roll('Kai', 'x', 10), roll('Mia', 'y', 12)])).toBeNull();
  });

  it('falls back to defaultRoleEvent for unknown members', () => {
    const sel = selectTeammateEvent(story, [roll('Zara', 'x', 18)]);
    expect(sel?.event.target).toBe(story.defaultRoleEvent.boon.target);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/branchingEvents.test.ts -t selectTeammateEvent`
Expected: FAIL — `selectTeammateEvent` is not exported.

- [ ] **Step 3: Implement `selectTeammateEvent`**

In `lib/branchingEngine.ts`, add to the import from `@/data/branchingStories`:

```ts
  type RoleEvent,
```

(so the import block reads `BranchNode, BranchEnding, BranchChoice, RoleEvent`). Then append at end of file:

```ts
/** A teammate roll considered for event selection. */
export interface TeammateRoll {
  name: string;
  role: string;
  roll: number;
}

/** The event chosen for a round (or null if none fired). */
export interface SelectedTeammateEvent {
  actorName: string;
  role: string;
  kind: "boon" | "chaos";
  event: RoleEvent;
}

/** A teammate roll at/above this fires that member's boon event. */
export const BOON_THRESHOLD = 15;
/** A teammate roll at/below this fires that member's chaos event (if no boon). */
export const CHAOS_THRESHOLD = 6;

/**
 * Pick at most one teammate event for the round from the teammates' rolls.
 * Boon (highest roll >= BOON_THRESHOLD) wins; else chaos (lowest <= CHAOS_THRESHOLD);
 * else null. The member's `roleEvents[name]` resolves the event, falling back to
 * `defaultRoleEvent` for unknown members.
 */
export function selectTeammateEvent(
  story: BranchingStory,
  rolls: TeammateRoll[],
): SelectedTeammateEvent | null {
  const eventsFor = (name: string) => story.roleEvents[name] ?? story.defaultRoleEvent;

  const boons = rolls.filter((r) => clampD20(r.roll) >= BOON_THRESHOLD);
  if (boons.length) {
    const top = boons.reduce((b, r) => (r.roll > b.roll ? r : b));
    return { actorName: top.name, role: top.role, kind: "boon", event: eventsFor(top.name).boon };
  }

  const chaoses = rolls.filter((r) => clampD20(r.roll) <= CHAOS_THRESHOLD);
  if (chaoses.length) {
    const low = chaoses.reduce((b, r) => (r.roll < b.roll ? r : b));
    return { actorName: low.name, role: low.role, kind: "chaos", event: eventsFor(low.name).chaos };
  }

  return null;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/branchingEvents.test.ts -t selectTeammateEvent`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/branchingEngine.ts tests/branchingEvents.test.ts
git commit -m "feat(engine): selectTeammateEvent (dice+role event trigger)"
```

---

## Task 3: Engine — `pickPivotalEvent`

**Files:**
- Modify: `lib/branchingEngine.ts`
- Test: `tests/branchingEvents.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/branchingEvents.test.ts`:

```ts
import { pickPivotalEvent, type LoggedEvent } from '@/lib/branchingEngine';

describe('pickPivotalEvent', () => {
  const ev = (round: number, kind: 'boon' | 'chaos', actorName: string): LoggedEvent => ({
    round, kind, actorName, role: 'x', line: 'l', coda: 'c', fromNode: 'a', toNode: 'b',
  });

  it('returns null for an empty log', () => {
    expect(pickPivotalEvent([])).toBeNull();
  });

  it('prefers a boon over a chaos', () => {
    expect(pickPivotalEvent([ev(1, 'chaos', 'Mia'), ev(2, 'boon', 'Kai')])?.actorName).toBe('Kai');
  });

  it('among boons, the latest round wins', () => {
    expect(pickPivotalEvent([ev(1, 'boon', 'Kai'), ev(3, 'boon', 'Momo')])?.actorName).toBe('Momo');
  });

  it('falls back to the latest chaos when no boon', () => {
    expect(pickPivotalEvent([ev(1, 'chaos', 'Mia'), ev(2, 'chaos', 'Momo')])?.actorName).toBe('Momo');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/branchingEvents.test.ts -t pickPivotalEvent`
Expected: FAIL — `pickPivotalEvent` / `LoggedEvent` not exported.

- [ ] **Step 3: Implement `pickPivotalEvent` and `LoggedEvent`**

Append to `lib/branchingEngine.ts`:

```ts
/** A teammate event that actually fired during a run (for the ending card). */
export interface LoggedEvent {
  round: number;
  actorName: string;
  role: string;
  kind: "boon" | "chaos";
  line: string;
  coda: string;
  fromNode: string;
  toNode: string;
}

/**
 * The single most impactful event of a run: a boon beats a chaos; among the same
 * kind the latest one wins (closest to the ending it led into). Null if empty.
 */
export function pickPivotalEvent(log: LoggedEvent[]): LoggedEvent | null {
  if (!log.length) return null;
  const latest = (arr: LoggedEvent[]) => arr.reduce((b, e) => (e.round >= b.round ? e : b));
  const boons = log.filter((e) => e.kind === "boon");
  if (boons.length) return latest(boons);
  return latest(log);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/branchingEvents.test.ts -t pickPivotalEvent`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/branchingEngine.ts tests/branchingEvents.test.ts
git commit -m "feat(engine): pickPivotalEvent for ending-card linkage"
```

---

## Task 4: Engine — `advance` event override

**Files:**
- Modify: `lib/branchingEngine.ts:68-80`
- Test: `tests/branchingEvents.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/branchingEvents.test.ts`:

```ts
import { advance } from '@/lib/branchingEngine';

describe('advance event override', () => {
  const story = pickBranchingStory('group-chat-trial');

  it('returns the event target when an override is given (keeping roll-based success)', () => {
    const r = advance(story, 'open', 0, 14, 'kai_receipt');
    expect(r.nextId).toBe('kai_receipt');
    expect(r.success).toBe(true);
  });

  it('ignores the override when undefined (normal routing)', () => {
    const r = advance(story, 'open', 0, 14);
    expect(r.nextId).toBe('calm'); // open.choices[0].onSuccess
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/branchingEvents.test.ts -t "advance event override"`
Expected: FAIL — override arg ignored, first case returns `calm` not `kai_receipt`.

- [ ] **Step 3: Add the optional override to `advance`**

Replace the `advance` function body (`lib/branchingEngine.ts:68-80`) with:

```ts
export function advance(
  story: BranchingStory,
  nodeId: string,
  choiceIndex: number,
  roll: number,
  eventTarget?: string,
): { nextId: string; success: boolean } {
  const node = story.nodes[nodeId];
  if (!node) return { nextId: nodeId, success: false };
  const i = Math.max(0, Math.min(Math.floor(choiceIndex), node.choices.length - 1));
  const choice = node.choices[i];
  const success = clampD20(roll) >= WIN_THRESHOLD;
  if (eventTarget) return { nextId: eventTarget, success };
  return { nextId: success ? choice.onSuccess : choice.onFail, success };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/branchingEvents.test.ts -t "advance event override"`
Expected: PASS.

- [ ] **Step 5: Run the full engine test file + typecheck**

Run: `npx vitest run tests/branchingEvents.test.ts && npx tsc --noEmit`
Expected: all PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/branchingEngine.ts tests/branchingEvents.test.ts
git commit -m "feat(engine): advance() optional event-target override"
```

---

## Task 5: Game loop — wire events, causal bridge, crisis delta, ending payload

**Files:**
- Modify: `hooks/useGameState.ts`

This task has no new unit test (it's React/stateful glue); it is verified by `tsc`, the existing engine tests, and the manual check in Task 8. Make the edits exactly.

- [ ] **Step 1: Extend imports and `GameState`**

In the engine import block (`hooks/useGameState.ts:14-24`) add `selectTeammateEvent`, `pickPivotalEvent`:

```ts
import {
  pickBranchingStory,
  branchPlayers,
  branchDetail,
  getNode,
  getEnding,
  isEnding,
  advance,
  selectTeammateEvent,
  pickPivotalEvent,
} from '@/lib/branchingEngine';
import type { BranchingStory } from '@/data/branchingStories';
import type { LoggedEvent } from '@/lib/branchingEngine';
```

In `interface GameState`, add two fields (after `marks`):

```ts
  /** Teammate events that fired this run (for the ending card recap). */
  eventLog: LoggedEvent[];
  /** Last meaningful tension change (from You's action), for meter microcopy. */
  lastTensionDelta: number;
```

In `interface GameState`, extend the `questCard` type — add these optional members inside its object type (after `theme?: string`):

```ts
    events?: Array<{ actorName: string; role: string; kind: 'boon' | 'chaos'; line: string }>;
    pivotal?: { actorName: string; kind: 'boon' | 'chaos'; coda: string } | null;
```

In `initialState`, add (after `marks: []`):

```ts
  eventLog: [],
  lastTensionDelta: 0,
```

- [ ] **Step 2: Record `lastTensionDelta` when You acts**

In `resolveActorChoice`, the `setState` that records the action (around `hooks/useGameState.ts:276-293`) currently sets `tension: clampTension(s.tension + tDelta)`. Add a sibling field so the meter can explain itself — change that object to also set:

```ts
      tension: clampTension(s.tension + tDelta),
      lastTensionDelta: isYou ? tDelta : s.lastTensionDelta,
```

(Leave `marks` and the rest of that object unchanged.)

- [ ] **Step 3: Add a causal-bridge helper**

Near the top of `useGameState.ts` (after the `ROAST` array, around line 52), add:

```ts
/** One DM line that makes You's choice + roll legible before the next scene. */
function causalBridge(choiceLabel: string, roll: number, swing?: { actorName: string; kind: 'boon' | 'chaos' }): string {
  const landed = roll >= 11 ? 'and it lands' : 'and it slips';
  let line = `You went with "${choiceLabel}" (${roll}) — ${landed}.`;
  if (swing) line += ` Then ${swing.actorName} ${swing.kind === 'boon' ? 'swings it your way' : 'sends it sideways'}.`;
  return line;
}
```

- [ ] **Step 4: Select the event and reroute inside `advanceStoryWithTeamResults`**

Replace the top of `advanceStoryWithTeamResults` (from the `const youResult` line through the `const { nextId: nextNodeId } = advance(...)` line, `hooks/useGameState.ts:341-346`) with:

```ts
    const youResult = state.actorResults.find((r) => r.actorName === 'You') ?? lastResult;

    const node = getNode(story, state.nodeId);
    if (!node) return;

    // Teammate (non-You) rolls → pick at most one event for the round.
    const roleOf = (name: string) => state.players.find((p) => p.name === name)?.role ?? name;
    const teammateRolls = state.actorResults
      .filter((r) => r.actorName !== 'You')
      .map((r) => ({ name: r.actorName, role: roleOf(r.actorName), roll: r.roll }));
    const selected = selectTeammateEvent(story, teammateRolls);

    const { nextId: nextNodeId } = advance(
      story,
      state.nodeId,
      youResult.choiceIndex,
      youResult.roll,
      selected?.event.target,
    );
```

- [ ] **Step 5: Post the causal bridge + event line, and log the event**

Immediately after the `await delay(900);` that follows `setState((s) => ({ ...s, narratorTyping: true }));` (around `hooks/useGameState.ts:349-350`), insert the bridge + event narration and build the new event-log entry:

```ts
    // Causal bridge — every turn — then the event line if one fired.
    const bridge = causalBridge(youResult.choiceLabel, youResult.roll, selected ? { actorName: selected.actorName, kind: selected.kind } : undefined);
    setState((s) => ({
      ...s,
      messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: bridge, kind: 'narration' as const }],
    }));
    let loggedEvents = state.eventLog;
    if (selected) {
      const entry: LoggedEvent = {
        round: state.round,
        actorName: selected.actorName,
        role: selected.role,
        kind: selected.kind,
        line: selected.event.line,
        coda: selected.event.coda,
        fromNode: state.nodeId,
        toNode: selected.event.target,
      };
      loggedEvents = [...state.eventLog, entry];
      await delay(250);
      setState((s) => ({
        ...s,
        eventLog: loggedEvents,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: selected.event.line, kind: 'narration' as const }],
      }));
      await delay(250);
    }
```

- [ ] **Step 6: Feed the event log + pivotal into the ending `questCard`**

In the ending branch of `advanceStoryWithTeamResults` (the `if (isEnding(story, finalNodeId))` block), find the final `setState` that sets `questCard` (around `hooks/useGameState.ts:412-427`). Replace its `questCard` object with one that appends the pivotal coda to the epilogue and carries the recap:

```ts
        questCard: (() => {
          const pivotal = pickPivotalEvent(loggedEvents);
          const epilogue = pivotal ? `${ending.scene} ${pivotal.coda}` : ending.scene;
          return {
            title: ending.title,
            caption: ending.caption,
            epilogue,
            highlight: highlight || journeyHighlights,
            best_interference: `${pivotal ? `Swung by ${pivotal.actorName} • ` : ''}MVP: ${mvpName} (${mvpScore} total) • ${stats.criticalSuccess} nat20s • ${stats.criticalFailure} nat1s`,
            final_roll: youResult.roll,
            cta: story.cta,
            marks: s.marks,
            tone: ending.tone,
            theme: story.theme,
            events: loggedEvents.map((e) => ({ actorName: e.actorName, role: e.role, kind: e.kind, line: e.line })),
            pivotal: pivotal ? { actorName: pivotal.actorName, kind: pivotal.kind, coda: pivotal.coda } : null,
          };
        })(),
```

Note: this uses `loggedEvents` (defined in Step 5), so it already includes this round's event. The `setState` callback param stays `(s) => ({ ... })` — keep `marks: s.marks` referencing the callback's `s`.

- [ ] **Step 7: Also feed events into the doom-collapse ending**

In the `willTension >= 100` block (`hooks/useGameState.ts:296-313`), the collapse builds its own `questCard`. Add the recap there too — replace that `questCard` object with:

```ts
        questCard: { title: 'It All Fell Apart', caption: 'too much chaos, too fast', epilogue: epi, highlight: '', best_interference: '', final_roll: d.value, cta: story.cta, marks: s.marks, tone: 'down', theme: story.theme, events: s.eventLog.map((e) => ({ actorName: e.actorName, role: e.role, kind: e.kind, line: e.line })), pivotal: (() => { const p = pickPivotalEvent(s.eventLog); return p ? { actorName: p.actorName, kind: p.kind, coda: p.coda } : null; })() },
```

- [ ] **Step 8: Reset the event log in `resetGame`**

`resetGame` already does `setState(initialState)`, which now includes `eventLog: []` and `lastTensionDelta: 0`. No change needed — confirm by reading `resetGame`.

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add hooks/useGameState.ts
git commit -m "feat(loop): teammate event reroute, causal bridge, ending recap payload"
```

---

## Task 6: Play UI — goal chip, crisis meter, scene-relevant reactions

**Files:**
- Modify: `components/PlayingScreen.tsx`

- [ ] **Step 1: Goal chip in the header area**

In `components/PlayingScreen.tsx`, the invite button is the first child of the root (around line 202). Immediately BEFORE that `<button onClick={() => setShowInvite(true)} ...>`, add a goal chip:

```tsx
      {/* Persistent goal — what this run is for */}
      {currentStory?.goalShort && (
        <div className="mx-4 mt-3 flex-shrink-0 flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'var(--zymix-green-light)' }}>
          <span className="text-sm flex-shrink-0">🎯</span>
          <span className="text-xs font-semibold truncate" style={{ color: 'var(--zymix-green)' }}>{currentStory.goalShort}</span>
        </div>
      )}
```

(`currentStory` already exists via `getStoryRef()` at line ~106.)

- [ ] **Step 2: Relabel the meter to the story crisis meter + add explainer + delta microcopy**

Replace the doom-clock block (`components/PlayingScreen.tsx:215-224`, the `<div className="mx-4 mt-2 flex-shrink-0 rounded-2xl ...">` through its closing `</div>` that holds the bar) with:

```tsx
      {/* Crisis meter — story-named; failure raises it; 100% collapses the run */}
      <div className="mx-4 mt-2 flex-shrink-0 rounded-2xl px-3.5 py-2.5" style={{ background: 'var(--zymix-surface)', border: '1px solid var(--zymix-border)' }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--zymix-text-secondary)' }}>
            {currentStory?.crisisMeter?.emoji ?? tIcon} {currentStory?.crisisMeter?.name ?? 'Tension'}
          </span>
          <span className="text-xs font-extrabold tabular-nums flex items-center gap-1" style={{ color: tColor }}>
            {state.lastTensionDelta !== 0 && (
              <span className="text-[10px]" style={{ color: state.lastTensionDelta > 0 ? '#EF4444' : '#1DB954' }}>
                {state.lastTensionDelta > 0 ? `▲${state.lastTensionDelta}` : `▼${-state.lastTensionDelta}`}
              </span>
            )}
            {state.tension}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--zymix-bg)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${state.tension}%`, background: `linear-gradient(90deg, ${tColor}99, ${tColor})` }} />
        </div>
        <div className="text-[10px] mt-1" style={{ color: 'var(--zymix-text-tertiary)' }}>Fails heat it up, wins cool it down — fill it and the night falls apart.</div>
      </div>
```

- [ ] **Step 3: Use scene-relevant reactions instead of generic NPC filler**

The NPC "choosing" effect (`components/PlayingScreen.tsx:165-172`) sets `npcActionRef.current` from `NPC_FLAVOR`. Replace that line:

```ts
    npcActionRef.current = NPC_FLAVOR[Math.floor(Math.random() * NPC_FLAVOR.length)];
```

with a draw from the current story's reactions pool (falling back to `NPC_FLAVOR`):

```ts
    const pool = currentStory?.reactions?.length ? currentStory.reactions : NPC_FLAVOR;
    npcActionRef.current = pool[Math.floor(Math.random() * pool.length)];
```

- [ ] **Step 4: Verify in the browser**

Start/refresh the dev server and confirm: the 🎯 goal chip shows, the meter is named per story (e.g. "🔥 Group Chat Meltdown") with the explainer line, a ▲/▼ delta appears after a roll, and NPC chat lines read like the story (not "films the whole thing").

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/PlayingScreen.tsx
git commit -m "feat(ui): goal chip, named crisis meter + explainer, themed reactions"
```

---

## Task 7: Ending card — Saved/Sank tag, coda, Turning Points

**Files:**
- Modify: `components/EndingCard.tsx`

- [ ] **Step 1: Extend the `card` prop type**

In `components/EndingCard.tsx`, add to the `card` object type (after `theme?: string;`, around line 38):

```ts
    events?: Array<{ actorName: string; role: string; kind: 'boon' | 'chaos'; line: string }>;
    pivotal?: { actorName: string; kind: 'boon' | 'chaos'; coda: string } | null;
```

- [ ] **Step 2: Render the dynamic headline tag**

Inside the tinted header, after the result badge `<div>` and before `<h2 ...>{card.title}</h2>` (around line 61), add:

```tsx
          {card.pivotal && (
            <div className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 ml-1" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
              {card.pivotal.kind === 'boon' ? `✨ Saved by ${card.pivotal.actorName}` : `💀 ${card.pivotal.actorName} nearly sank it`}
            </div>
          )}
```

(The pivotal coda is already part of `card.epilogue` — appended in the hook — so the epilogue paragraph needs no change.)

- [ ] **Step 3: Render the Turning Points recap**

After the "What you carried" marks block (the `{card.marks && card.marks.length > 0 && (...)}` block, ending around line 105) and before the run-stats block, add:

```tsx
          {/* Turning points — the teammate events that changed the night */}
          {card.events && card.events.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--zymix-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Turning points
              </div>
              <div className="flex flex-col gap-1.5">
                {card.events.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--zymix-text-primary)' }}>
                    <span className="flex-shrink-0">{e.kind === 'boon' ? '🔀' : '💥'}</span>
                    <span className="leading-snug"><span className="font-semibold">{e.actorName} · {e.role}</span> — {e.line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
```

- [ ] **Step 4: Verify in the browser**

Play a full run (the high NPC bias makes an event very likely). On the ending card confirm: a "✨ Saved by …" / "💀 … nearly sank it" tag in the header, the epilogue ends with the pivotal coda sentence, and a "Turning points" list shows the fired events.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/EndingCard.tsx
git commit -m "feat(ui): ending card event recap — saved/sank tag, coda, turning points"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: all tests pass (existing + new `tests/branchingEvents.test.ts`).

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no type errors; lint clean (or only pre-existing warnings).

- [ ] **Step 3: Manual end-to-end (browser)**

Start the dev server from the project dir and play each of the 4 themes once. Confirm for each:
- 🎯 goal chip persists during play.
- Crisis meter shows the story name + explainer + ▲/▼ delta.
- After your roll, a DM causal bridge line appears ("You went with … (n) — and it lands."), and when a teammate swings it, the event line + a rerouted scene follow.
- The ending card shows the Saved/Sank tag, the coda-extended epilogue, and Turning points.

- [ ] **Step 4: Final commit (if anything was tidied)**

```bash
git add -p
git commit -m "chore: teammate-driven story events — final tidy"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** teammate event trigger (Task 2), reroute/override (Task 4), dedicated boon nodes + chaos reuse + codas + crisis meter names + short goals (Task 1), causal bridge every turn (Task 5 Step 3/5), goal chip (Task 6 Step 1), crisis meter relabel/explainer/delta (Task 6 Step 2), themed reactions (Task 6 Step 3), event log + pivotal + ending payload (Task 5 Steps 5-7), ending card tag/coda/turning points (Task 7). Data integrity + engine purity tests (Tasks 1-4). All spec sections map to a task.
- **Type consistency:** `RoleEvent`/`RoleEvents` (data) → `TeammateRoll`/`SelectedTeammateEvent`/`LoggedEvent` (engine) → `eventLog`/`questCard.events`/`questCard.pivotal` (hook) → `card.events`/`card.pivotal` (EndingCard). `selectTeammateEvent`, `pickPivotalEvent`, `advance(…, eventTarget?)` names match across tasks. `crisisMeter`, `goalShort`, `lastTensionDelta` consistent across data/hook/UI.
- **Placeholder scan:** none — all code blocks are complete.
