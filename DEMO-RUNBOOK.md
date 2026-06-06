# Demo Runbook (3 minutes) · Roll Call

> Demo follows DESIGN.md §12 (the perfect `GLM_OFFLINE=true` run). Build/demo in Claude Code on GLM so Orbie captures the process (Z.ai×Orbit evidence).

## Demo setup
- Story (random pool, fixed for demo): **The 404 Customer** — a late-night convenience store disconnects from the world; the register reads "Welcome, customer #404."
- Players & roles: **Luna** = Delivery Driver · **Jake** = Lost Student · **Kai** = Store Manager · **Alex** = Investigator · **Emma** = CCTV-room Operator (role name under each avatar).
- External intervention (5-minute disappearing invite): **"Future Self Text"** — every character gets a text from their future self; one is lying.

## Three fallback tiers (pick by venue network)
- **Good network:** `GLM_OFFLINE=false` + real `GLM_API_KEY` → live GLM generates the story (most impressive).
- **Bad / risky network:** `GLM_OFFLINE=true` → the perfect chain runs from fallback, **zero crashes**.
- **Last resort:** play the pre-recorded perfect run.

## Beat sheet (~3 min, DESIGN §12)
- **0:00–0:25 pain point:** show a dead chat ("3 days, no messages, nobody wants to speak first") + the line: *"Not another chatbot — we turn a quiet chat into a mini AI adventure: roles are random, actions judged by dice, and every result changes what happens next."*
- **0:25–0:50 cold prompt:** the in-chat prompt appears → tap **Start the adventure**.
- **0:50–1:15 AI random story + roles:** the 404 convenience-store cold open; roles assigned (Luna/Jake/Kai/Alex/Emma) with role names under avatars.
- **1:15–1:45 first action + dice:** Kai picks "photograph the video" → **D20 = 15 Success** → consequence: Kai has seen this clip for the 72nd time; trust in Kai shifts.
- **1:45–2:10 external time-limited intervention:** tap **Invite a friend to interfere** → external page with a 5-minute countdown → friend types "Everyone gets a text from their future self" → "This invitation will disappear in 5 minutes."
- **2:10–2:40 round 2 (intervention hits everyone):** AI weaves it in — each character gets a future text, one is lying; Luna doubts Kai; Jake's text mentions a non-existent exit. Players keep acting + rolling.
- **2:40–3:00 ending card:** "Quest Completed · Customer #404 · most pivotal roll Kai D20=15 · best intervention Future Self Text · mood: chaotic but alive again · Start your own Roll Call on Zymix" → save/share. Closing line: *"Roll Call makes one quiet group enough to start a social moment — without reading chat history or forcing a topic."*

## Pre-show checklist
- [ ] `.env.local` ready (GLM_OFFLINE=true as safety, or a real key with false)
- [ ] Plan B recording ready (incl. the 5-minute-invite segment)
- [ ] Dev server up; main page + intervention page both warmed up
- [ ] Role names show under avatars; D20 banner colors correct
- [ ] 5-minute invite shows the countdown and the "disappeared" state
- [ ] Ending card can be screenshotted/downloaded
- [ ] No white screen on any LLM failure (silent fallback)
- [ ] Mobile 375px layout looks right
- [ ] Two screens ready (demo device + "friend's phone") for the intervention switch

## Anti-crash notes
- ~3 rounds; ≤2 narration sentences per round.
- Intervention input failure → local mock intervention.
- Whole chain pre-generated as fallback; if the API dies, cut to the recording.
