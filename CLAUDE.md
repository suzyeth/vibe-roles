# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Vibe Roles** — a 24h hackathon prototype for VibeHack London 2026 (Track 2 "Vibe with Zymix"). A single-screen web app that simulates a Zymix group chat: one tap has GLM improvise a 30-second micro-theater, cast the people present into roles, run an AI-narrated turn-based scene, and emit a shareable "highlight card" at the end.

**Current state matters:** the repo is a fresh `create-next-app` scaffold. `app/page.tsx` is still the default Next.js template. The real design — `lib/`, `components/`, `data/`, `app/api/`, `tests/` — is fully specified in `PLAN.md` (task-by-task with complete code and tests) but **not yet implemented**. Treat `PLAN.md` as the source of truth for what to build; `DESIGN.md` is the product spec behind it.

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
npx vitest run -t "拒绝 roles 为空"
```

Vitest only picks up `tests/**/*.test.ts` (node environment). The `@` alias maps to the repo root in **both** `vitest.config.ts` and `tsconfig.json` — import as `@/lib/...`, `@/data/...`.

## Architecture (target, per PLAN.md)

The design separates **pure, testable logic** from **side-effecting glue**:

- `lib/` — single-responsibility pure functions, built TDD-first (write the failing test in `tests/`, then implement):
  - `schema.ts` — Zod `SceneSchema` / `HighlightSchema` + inferred types (`Scene`, `Role`, `Highlight`). These types are the contract shared across fallback, director, routes, and components — keep signatures consistent.
  - `director.ts` — casting/degradation/prompt building: `padWithNPCs` (pads actors to ≥3 with NPCs), `buildScenePrompt`, `buildNarratePrompt`.
  - `fallback.ts` — pre-written scene/narration/highlight used whenever GLM is unavailable or returns invalid data.
  - `env.ts` — `isOffline()` reads `GLM_OFFLINE`.
  - `glm.ts` — the **only** networked module. Thin OpenAI-compatible client (`glmJSON` / `glmText`); intentionally untested (no live API in unit tests).
- `app/api/{scene,narrate,highlight}/route.ts` — thin orchestration only: pad actors → if offline return fallback → call GLM → validate with Zod → on **any** throw, return fallback.
- `app/page.tsx` — owns the game state machine (`idle → loading → playing → ended`) and wires components to the API routes.
- `components/` — presentational only (`MessageBubble`, `RoleCardList`, `HighlightCard`, `Composer`, `ThemePicker`).
- `data/` — preset Zymix members and theme whitelist.

### Invariants to preserve

- **Never let the demo crash.** Every API route must fall back on failure, and `GLM_OFFLINE=true` must force the fallback path end-to-end. The fallback's `fallbackScene` output must itself pass `SceneSchema`.
- **`roles.length === members.length`** and every present member appears in the cast.
- `padWithNPCs` guarantees at least 3 actors before any scene is built (single-person / lurker degradation).
- GLM output is untrusted: always `SceneSchema.parse(...)` / `HighlightSchema.parse(...)` before returning; a parse failure is a fallback trigger, not an error to surface.

## Two separate GLM wirings — don't conflate them

This project uses GLM (Z.ai) in two unrelated places:

1. **Claude Code → GLM** (`.claude/settings.json`): redirects this agent's own inference to GLM via `ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic`. This is the dev-workflow integration; it has nothing to do with app runtime.
2. **App → GLM** (`lib/glm.ts` + `.env.local`): the product's runtime engine, using the OpenAI-compatible endpoint `GLM_BASE_URL=https://api.z.ai/api/paas/v4` and `GLM_MODEL` (default `glm-4.6`). Editing `.env.local` switches the live app, not the agent.

`ORBIT-GLM-GUIDE.md` documents both wirings and the endpoint/model caveats (endpoint and model names are confirmed per event resources, not assumed).

## Hackathon context

The deliverable for the Z.ai × Orbit prize is process evidence, not just the app: keep frequent git commits, narrate *why* GLM is used in prompts, and the final `capture my persona` package uploads to **orbit24.uk** (not Devpost). See `ORBIT-GLM-GUIDE.md` and `PLAN.md` Task 15. `README.md` has the open-of-event startup steps.
