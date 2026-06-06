# Vibe Dice — Implementation Plan & Status

> The prototype is implemented and passing tests, so this is now an architecture + build reference rather than a task-by-task TDD script. Product rules live in [DESIGN.md](./DESIGN.md); the **canonical engineering spec is [SPEC.md](./SPEC.md)** (state machine, schemas, AI calls, routes, UI, fallback, demo data) — if anything here disagrees with SPEC.md, SPEC.md wins; award/GLM setup in [ORBIT-GLM-GUIDE.md](./ORBIT-GLM-GUIDE.md).
>
> Target routes per SPEC §9: `quest` (Call 1) · `action` (Call 2) · `roll` (Call 3) · `ending` (Call 4) · `fate` (GET). The current build may still use `actions`/`questcard`/`prologue` — aligning to SPEC names is part of the SPEC-alignment work.

**Goal:** A single-screen Next.js prototype where a cold ZYMIX chat is revived into a 3-minute, DND-like AI dice adventure: the AI Game Master narrates, dice decide outcomes, the group reacts in character, external friends interfere via a share link (Fate Cards), and the run ends with a shareable Quest Card.

**Architecture:** Reuse Next.js 14 + TS + Tailwind + Zod + Vitest + a thin GLM client, with a `GLM_OFFLINE` fallback path so the demo never crashes. Pure, testable logic lives in `lib/` (TDD); API routes are thin orchestration; the page is a quest state machine; a dynamic route hosts the friend interference page. No real backend — a module-level in-memory store links the main game and the interference page within one dev process.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Zod, Vitest, GLM (OpenAI-compatible), html-to-image (card export), Fotor (polished/marketing card).

---

## File structure
```
lib/
  dice.ts          roll number -> result label (pure, tested)
  schema.ts        Quest / Player / FateCard (5-type whitelist) / RoundResult (narration + reactions) / QuestCard (pure, tested)
  fallback.ts      offline fallbacks: quest / round / fate / questcard (pure, tested)
  director.ts      prompt builders: quest / roll / fate / questcard (pure, tested)
  questStore.ts    in-memory store linking main game <-> interference page (pure, tested)
  prologue.ts      opening / story prologue content (pure, tested)
  glm.ts           thin OpenAI-compatible client (networked; untested)
  env.ts           isOffline() reads GLM_OFFLINE
  cardExport.ts    export Quest Card DOM to PNG (Fotor fallback)
app/api/
  quest/route.ts       open a quest, store it
  roll/route.ts        resolve a roll: narration + per-round member reactions, weave Fate Cards
  fate/route.ts        friend input -> Fate Card (POST), list (GET)
  questcard/route.ts   final shareable Quest Card
  prologue/route.ts    story prologue
app/
  page.tsx          quest state machine (cold -> playing x3 rounds -> ended)
  q/[id]/page.tsx   external friend Fate Card interference page
components/
  DiceRoller, RollResultBanner, FateCardList, QuestCard, MessageBubble, MiniAppBar, DeadGroup
data/
  quest.ts (themes + fate type catalog), members.ts, deadGroup.ts
tests/
  dice, schema, fallback, director, questStore, env, prologue
```

## Build phases (as built)
1. **Foundation** — Next.js + Tailwind + Vitest scaffold; `GLM_OFFLINE` switch.
2. **Pure core (TDD)** — dice mapping, schemas, fallbacks, prompt builders, in-memory store, prologue.
3. **API routes** — quest / roll / fate / questcard / prologue, each: offline → fallback, else GLM → Zod-validate → on any throw, fallback.
4. **UI** — dice roller, roll banner, fate list, quest card, chat bubbles, Zymix-style Mini App shell, dead-group cold open.
5. **State machine** — cold → roll loop (3 rounds, live Fate Card fetch before each roll) → Quest Card.
6. **Interference page** — `/q/[id]` for friends to add a Fate Card without downloading.

## Invariants (must hold)
- **Never crash the demo.** Every route falls back; `GLM_OFFLINE=true` forces the fallback path end-to-end; fallback output passes its Zod schema.
- **Multiple voices each round.** Narrator advances AND other players (members != "You") drop short in-character lines (DESIGN §3.3). Narration is 2–4 vivid, connected sentences.
- **GLM output is untrusted** — always `*.parse(...)` before returning; a parse failure is a fallback trigger.
- **Content safety** — theme whitelist + Fate Card type whitelist; no violence/explicit/hate.
- **All in-product text is English.**

## Status
- ✅ Implemented and passing tests (`npm test`), builds clean (`npm run build`).
- ⏳ Time-boxed / optional: Sleeping NPC "re-enter" UI; Wallet/Leaderboard hooks; real Fotor integration (currently PNG export); richer multi-round narration per DESIGN §3.3 (ongoing tuning in `lib/director.ts`).
- 📸 Required before demo: download ZYMIX, capture first-hand screenshots into `evidence/zymix-firsthand/`, fill DESIGN §1.2.1.

## Verify
```powershell
npm test            # all green
npx tsc --noEmit    # clean
npm run build       # succeeds
```
Offline walkthrough (GLM_OFFLINE=true): cold chat → pick theme → roll x3 (open /q/<id> mid-run and submit a Fate Card) → Quest Card → save PNG.
