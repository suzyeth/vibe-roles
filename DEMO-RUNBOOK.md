# Demo Runbook (3 minutes) · Vibe Dice

> On the day, build/demo in Claude Code connected to GLM (so Orbie captures the process) — that's the Z.ai×Orbit evidence.

## Three fallback tiers (pick by venue network)
- **Good network**: set `GLM_OFFLINE=false` + a real `GLM_API_KEY` in `.env.local` → live GLM generates the quest + Fate Cards (most impressive).
- **Bad / risky network**: set `GLM_OFFLINE=true` → everything runs on the fallback quest + mock Fate Cards, **zero crashes**.
- **Last resort**: play the pre-recorded perfect run.

## Beat sheet (aligned to DESIGN §12)
- **0:00–0:30 first-hand pain point** (use your post-download ZYMIX screenshots): tell it as a real user — empty group space, few playable Mini Apps, wheel-spin promos, "nobody knows what to say first." Then the differentiation line: "Not another chatbot — we turn silence into a 3-minute AI dice adventure, and even friends outside ZYMIX can interfere via WhatsApp."
- **0:30–0:45 why it belongs in ZYMIX**: a lightweight entry one person can start that pulls external friends in — it should be a ZYMIX Mini App.
- **0:45–1:10 one-tap start**: tap **Roll to revive this chat** → AI opening (The Unread Beast steals the topic) + role assignment.
- **1:10–1:35 first roll**: roll = 7 → Messy Progress; the **Ask friends to interfere** button appears.
- **1:35–2:00 WhatsApp friend interferes**: share link page → friend types "Everyone can only speak in food metaphors" → **Curse Card: Food Metaphor Mode**.
- **2:00–2:30 second roll + weave-in**: roll = 18 → Main Character Moment; AI weaves the curse in, the beast becomes a bowl of noodles.
- **2:30–2:45 result card**: Quest Card pops (Best Interference / chaotic but alive / Start your own quest on Zymix) → save & share.
- **2:45–3:00 impact**: one user is enough to start; spreads via WhatsApp; external friends join without downloading; Quest Card brings them back to ZYMIX.

## Pre-show checklist
- [ ] `.env.local` ready (GLM_OFFLINE=true as safety, or a real key with false)
- [ ] Plan B recording ready (including the share-link interference segment)
- [ ] Dev server up; main page + Fate Card interference page both opened and warmed up
- [ ] Quest Card "save/share" works
- [ ] Two screens ready (demo device + "friend's phone") to show the WhatsApp interference switch

## Anti-crash notes
- 3 rounds fixed; each beat 2–4 vivid sentences (DESIGN §3.3).
- Fate Card input failure → local mock card.
- Whole chain pre-generated as fallback; if the API dies, cut to the recording.
