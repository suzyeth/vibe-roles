# Demo Runbook (3 minutes) · Vibe Dice

> Demo data and beat sheet follow SPEC.md §10 (the perfect `GLM_OFFLINE=true` run). Build/demo in Claude Code on GLM so Orbie captures the process (Z.ai×Orbit evidence).

## Demo setup (SPEC §10)
- Theme: **Flat Drama** (`flat-drama`)
- Players: **Jamie, Kai, Mia**
- Pre-seeded Fate Card: **Food Metaphor Mode** — submitted by **Sarah (WhatsApp)**, triggers at **round_2**

## Three fallback tiers (pick by venue network)
- **Good network:** `.env.local` `GLM_OFFLINE=false` + real `GLM_API_KEY` → live GLM generates the story (most impressive).
- **Bad / risky network:** `GLM_OFFLINE=true` → the §10 perfect chain runs from fallback, **zero crashes**.
- **Last resort:** play the pre-recorded perfect run.

## Beat sheet (~3 min)
- **0:00–0:30 first-hand pain point** (use your ZYMIX screenshots from `evidence/zymix-firsthand/`): empty group space, few playable Mini Apps, wheel-spin promos, "nobody knows what to say first." Then the line: *"Not another chatbot — we turn a dead chat into a 3-minute AI dice adventure; even friends outside ZYMIX can interfere via WhatsApp."*
- **0:30–0:45 why it belongs in ZYMIX:** a lightweight Mini App one person can start that pulls external friends back in.
- **0:45–1:05 cold open + roles:** tap **Roll to revive** → the 2am pasta-theft cold open → roles flip: Jamie = The Forensic Foodie, Kai = The Ghost Rogue, Mia = The Chaos Bard.
- **1:05–1:30 Beat 1 (Jamie):** pick "Demand a full forensic investigation" → roll **7 / Messy Progress** → GM narrates the microwaved-pasta evidence; Mia chimes in.
- **1:30–1:55 Beat 2 (Kai):** "Deny everything and blame the pigeon" → roll **3 / Awkward Fail** → the pigeon alibi makes it worse.
- **1:55–2:20 Fate Card + Beat 3 (Mia):** **Food Metaphor Mode** (Sarah, WhatsApp) fires at round_2 → Mia "Deliver a courtroom closing argument" → roll **18 / Main Character Moment** → "carbohydrate closure" verdict.
- **2:20–2:35 Wrap it up → ending:** tap **Wrap it up** → twist ending ("…the chat now has 47 unread messages").
- **2:35–3:00 Quest Card + impact:** Quest Card pops ("The Great Pasta Incident: Resolved" · "Chaotic but fed") → save/share → close: one user is enough to start; spreads via WhatsApp; non-users join without downloading; Quest Card pulls them back to ZYMIX.

## Pre-show checklist (SPEC §11)
- [ ] `.env.local` ready (GLM_OFFLINE=true as safety, or a real key with false)
- [ ] Plan B recording ready (incl. the share-link interference segment)
- [ ] Dev server up; main page + `/q/[id]` interference page both warmed up
- [ ] Fate Card fires at round_2 and shows in the chat
- [ ] Dice animation + result-banner colors correct
- [ ] Quest Card can be screenshotted/downloaded
- [ ] No white screen on any LLM failure (silent fallback)
- [ ] Mobile 375px layout looks right
- [ ] Two screens ready (demo device + "friend's phone") for the WhatsApp interference switch

## Anti-crash notes
- Beat cap + "Wrap it up"; each beat 2–4 vivid sentences (DESIGN §3.3).
- Fate Card input failure → local mock card.
- Whole §10 chain pre-generated as fallback; if the API dies, cut to the recording.
