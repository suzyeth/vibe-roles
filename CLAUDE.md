# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Roll Call** (formerly Roll Call) — a ZYMIX-native cold-group-revival mini game. When a group chat has been quiet for ~72 hours, a light prompt appears. If one person taps Start, the AI generates a random DND-like story, assigns each member a role, runs a 3-round turn-based adventure with D20 rolls, and ends with a shareable "highlight card."

VibeHack London 2026 · Track 2 "Vibe with ZYMIX". See [DESIGN.md](./DESIGN.md) for product spec and [PLAN.md](./PLAN.md) for implementation tasks.

## Commands

```powershell
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run lint         # next lint (eslint: next/core-web-vitals + next/typescript)
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch
npx tsc --noEmit     # typecheck (strict mode is on)
```

Run a single test file or pattern:
```powershell
npx vitest run tests/schema.test.ts
npx vitest run -t "fallback quest structure"
```

Vitest only picks up `tests/**/*.test.ts` (node environment). The `@` alias maps to the repo root in **both** `vitest.config.ts` and `tsconfig.json` — import as `@/lib/...`, `@/data/...`.

## Architecture

The design separates **pure, testable logic** from **side-effecting glue**:

### `lib/` — pure functions, built TDD-first

- `schema.ts` — Zod schemas (`QuestSchema`, `FateCardSchema`, `RoundResultSchema`, `QuestCardSchema`, etc.) + inferred types. These are the contract shared across fallback, director, routes, and components.
- `director.ts` — prompt building: `buildQuestPrompt`, `buildProloguePrompt`, `buildActionsPrompt`, `buildRollPrompt`, `buildFateCardPrompt`, `buildQuestCardPrompt`.
- `fallback.ts` — pre-written quest/prologue/narration/highlight used whenever GLM is unavailable or returns invalid data. Fallback outputs must pass their respective Zod schemas.
- `env.ts` — `isOffline()` reads `GLM_OFFLINE` environment variable.
- `glm.ts` — the **only** networked module. Thin OpenAI-compatible client (`glmJSON` / `glmText`); intentionally untested (no live API in unit tests).
- `dice.ts` — D20 roll logic with Fate Card effects.
- `questStore.ts` — in-memory store using `globalThis` to share state across Next.js API routes (`/api/quest`, `/api/roll`, `/api/fate`, etc.). HMR-resistant: survives route reloads within the same process.
- `cardExport.ts` — QuestCard image export logic.

### `app/api/` — thin orchestration routes

- `/api/quest` — generates quest + prologue; creates quest in store.
- `/api/actions` — fetches action options for the active player.
- `/api/roll` — resolves dice roll with narration and story state updates.
- `/api/fate` — converts friend input into a Fate Card.
- `/api/questcard` — generates shareable ending card.

All routes follow: pad actors → if offline return fallback → call GLM → validate with Zod → on **any** throw, return fallback.

### `app/page.tsx` — game state machine

Owns the phase state (`cold → loading → choosing → rolling → playing → ended`) and wires components to the API routes. The client side orchestrates the 3-round loop.

### `components/` — presentational

`MiniAppBar`, `DeadGroup` (cold-group 72h prompt), `MessageBubble`, `DiceRoller`, `RollResultBanner`, `FateCardList`, `QuestCard`.

### `data/` — preset data

Zymix members (`members.ts`), dead group config, and quest themes.

### Invariants to preserve

- **Never let the demo crash.** Every API route must fall back on failure, and `GLM_OFFLINE=true` must force the fallback path end-to-end.
- `questStore` uses `globalThis.__vibeRolesStore` to survive Next.js route module boundary — this is intentional, not a bug.
- GLM output is untrusted: always `Schema.parse(...)` before returning; a parse failure is a fallback trigger, not an error to surface.
- **Reactions required:** `buildRollPrompt` ensures every reacting member gets exactly one in-character line.

## Two separate GLM wirings — don't conflate them

1. **Claude Code → GLM** (`.claude/settings.json`): redirects this agent's own inference to GLM via `ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic`. Dev-workflow integration only.
2. **App → GLM** (`lib/glm.ts` + `.env.local`): runtime engine using `GLM_BASE_URL=https://api.z.ai/api/paas/v4` and `GLM_MODEL` (default `glm-4.6`).

`ORBIT-GLM-GUIDE.md` documents both wirings and endpoint/model caveats.

## Hackathon context

Deliverable for the Z.ai × Orbit prize is process evidence, not just the app: keep frequent git commits, narrate *why* GLM is used in prompts, and the final `capture my persona` package uploads to **orbit24.uk**. See `ORBIT-GLM-GUIDE.md` and `PLAN.md` Task 15.