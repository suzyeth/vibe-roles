# 30-Minute Opening Sprint (for the team)

> Goal: within 30 minutes of kickoff, get everyone's env running, walk the prototype once, split the work, and make sure "build with GLM + Orbie recording" starts counting toward the Z.ai×Orbit award.

## Split roles first (30 seconds)
- **Team leader**: owns the Devpost submission + Orbit packaging/upload (one zip per team).
- **Frontend/UX**: polish the prototype UI to feel ZYMIX-native.
- **AI/Prompt**: tune the quest/roll/fate prompts in `lib/director.ts` for rich, DND-like story.
- **Assets/Fotor**: Fotor integration for the Quest Card + a marketing poster/story post.
> Everyone works in their **own Claude Code (GLM + Orbie loaded)**; each runs `capture my persona` at the end and hands their folder to the leader.

## 0–5 min · Environment
- [ ] Open the project: `cd C:\Users\ASUS\Desktop\VibeRoles`
- [ ] Get a GLM key: `https://zai-hackathon.zeabur.app/` (or GLM Discord)
- [ ] Fill the key in `.claude/settings.json` (`ANTHROPIC_AUTH_TOKEN`) and `.env.local` (`GLM_API_KEY`)
- [ ] `npm install`

## 5–10 min · Connect GLM + load Orbie (prerequisite for the Z.ai×Orbit award)
- [ ] Launch `claude` in the project dir → `/status` confirms GLM is active (Claude model names in the UI are fine)
- [ ] First message loads Orbie:
  > `Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026. Acknowledge once, then stay silent until I name you or trigger capture. Log my code and cognitive layers in the background.`

## 10–15 min · Walk the prototype (offline first, so everyone can run it)
- [ ] Set `.env.local` `GLM_OFFLINE=true`
- [ ] `npm run dev` → open http://localhost:3000
- [ ] Walk it: cold chat → pick a theme → roll x3 (open `/q/<id>` mid-way and submit a Fate Card) → Quest Card → save PNG
- [ ] Then try `GLM_OFFLINE=false` once with a real key (confirm GLM works)

## 15–25 min · Work in parallel
- [ ] **Frontend**: ZYMIX palette/fonts, member avatars, make the "Mini App" shell convincing
- [ ] **Prompt**: in `lib/director.ts`, make narration richer (DESIGN §3.3: 2–4 vivid sentences, in-character GM, per-round member reactions)
- [ ] **Fotor**: render the Quest Card via a Fotor template/API; make a poster + a "dead chat revived" story post
- [ ] **Evidence (everyone)**: state "why GLM" out loud in prompts; commit often; drop screenshots into `evidence/`

## 25–30 min · Align demo + safety
- [ ] Walk the 3-minute beat sheet in `DEMO-RUNBOOK.md`, assign who says what
- [ ] Record an **offline fallback** perfect run (Plan B)
- [ ] Confirm the three submission targets: Devpost (main + Fotor link + Manus link), Orbit (Ortie package to orbit24.uk)

## ⏰ Wrap-up (near the 12:00 deadline)
- [ ] Everyone `capture my persona` → hand folder to the leader
- [ ] Leader zips `team-<name>/` → upload to `orbit24.uk`
- [ ] Devpost main submission + verify all links open in a no-login window
- [ ] Leave buffer, don't cut it close
