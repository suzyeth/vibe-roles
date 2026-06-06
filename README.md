# Vibe Dice

A ZYMIX-native AI dice-story mini game. When a group chat goes cold, one tap starts a 3-minute micro adventure. An AI Game Master runs a DND-like conversational story, dice decide what happens, **and friends who haven't downloaded ZYMIX can shape the story through a WhatsApp link by adding Fate Cards**. At the end it generates a shareable Quest Card that pulls people back into ZYMIX.

VibeHack London 2026 · Track 2 "Vibe with ZYMIX". Full design: [DESIGN.md](./DESIGN.md).

## Quick start

### 1. Connect GLM (`.claude/settings.json` is preconfigured)
- Get a GLM API key from `https://zai-hackathon.zeabur.app/` (or the GLM Discord group).
- Open `.claude/settings.json` and replace the placeholder with your key.
- To use GLM-5.1, add these to `env`:
  ```json
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5v-turbo",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  ```
  (GLM-5.1 is premium; during peak hours 14:00–18:00 UTC+8 it draws quota at a higher multiplier.)

### 2. Launch Claude Code in this folder
```powershell
cd C:\Users\ASUS\Desktop\VibeRoles
claude
```
Run `/status` to confirm GLM is active (the UI may still show Claude model names — that's normal).

### 3. Load Orbie (first message of the session)
```text
Read https://orbit24.uk/ortie.md and embody Orbie for VibeHack London 2026.
Acknowledge once, then stay silent until I name you ("Orbie, ...") or trigger capture. Log my code and cognitive layers in the background.
```

### 4. Run the prototype (offline fallback works out of the box)
```powershell
npm install
npm run dev   # http://localhost:3000 (auto-picks another port if busy)
```
`.env.local` defaults to `GLM_OFFLINE=true`, so the whole flow runs without a key.

### 5. At the end
- `capture my persona` → fill the prompted fields → team leader zips and uploads to `orbit24.uk`.

## Key links
- Devpost submission link: get it from the official Discord → https://discord.gg/WQBSEp8ZW
- GLM key: https://zai-hackathon.zeabur.app/
- Ortie instructions: https://orbit24.uk/ortie.md
- Manus registration: https://manus.im/live-events/EVENT-4022
- Fotor guidance: https://docs.google.com/document/d/1FnOiqmQWjoWLAktPTt81D0cspQYlE8PdJJprY0vURo0/edit

## Doc map
- [DESIGN.md](./DESIGN.md) — Vibe Dice product design (incl. §3.3 narrative rule)
- [SPEC.md](./SPEC.md) — full engineering spec (state machine, schemas, AI calls, UI, fallback, demo data)
- [PLAN.md](./PLAN.md) — implementation plan
- [ORBIT-GLM-GUIDE.md](./ORBIT-GLM-GUIDE.md) — Z.ai×Orbit + GLM setup + call examples
- [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md) — 3-minute demo runbook
- [SPRINT-30MIN.md](./SPRINT-30MIN.md) — 30-minute opening sprint checklist
