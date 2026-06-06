# Vibe Dice — Product Design Doc (DESIGN.md)

> VibeHack London 2026 · Track 2 "Vibe with ZYMIX" — design source of truth
> Rebuilt from the earlier "Vibe Roles" concept (v3 pivot)
> Last updated: 2026-06-06

## 0. One-line positioning
**A ZYMIX-native AI dice-story mini game: when a group chat goes cold, one tap starts a 3-minute micro adventure. An AI Game Master runs the story, dice decide what happens, and friends can interfere through WhatsApp / contacts links by adding characters, curses, objects, and world rules.**

Differentiation line (say it first in the demo):
> "We're not another chatbot in the group, and we're not a heavy DnD. We turn a dead chat into a 3-minute AI dice adventure, and even friends who haven't downloaded ZYMIX can shape the story through WhatsApp."

Short name: **Vibe Dice**
Alternatives: **RollQuest / Chaos Quest / Zymix Side Quest**

> Branding note: don't pitch it as "DnD" to judges. Dungeons & Dragons is a loaded brand and makes the system sound heavy. Use phrasing like "AI dice story game", "micro roleplay quest", "chat-based adventure". (Internally, the *experience target* is a DND-like AI Game Master — see §3.3.)

---

## 1. Background & opportunity

### 1.1 The competition
- VibeHack London 2026, 24-hour hackathon, 3-minute live table-side demo.
- Track: Vibe with ZYMIX (build an AI-native feature for the Gen Z social app "ZYMIX").
- Submission: Devpost (main); deadline Sun 7 June 2026, 12:00.
- Scoring weights: **Relevance 25% / Originality 20% / UX 20% / Effective use of AI 20% / Demo polish 15%**.

### 1.2 ZYMIX reality (from prior research)
- A UK Gen Z all-in-one social SuperApp ("Social. Pay. Explore.").
- Features: encrypted chat, Social Scene (nearby / anonymous polls / leaderboards / limited-time events / campus & nightlife / group spaces), Wallet (points / tipping / voting / bill-split), Mini Apps (short drama / livestream / lightweight games / local services), AI assistant.
- Very early stage: ~61 downloads in the last 30 days; App Store 4.6 (only 9 ratings).
- User feedback: 👍 "the mini games are fresh and fun"; 👎 spammy push after signup, too many wheel-spin promos, low activity.

### 1.2.1 First-hand experience notes (fill after downloading ZYMIX — required)
> The official announcement requires "Download and experience Zymix as a real user first." §1.2 above is derived from store metadata, which judges can also do. After installing, write down concrete, button-level, second-level pain points (5–10 of them). Open the demo with these — far stronger than stats. Archive screenshots in `evidence/zymix-firsthand/`.

- [ ] Sign-up flow: ________ (which step stalls? what permissions?)
- [ ] First look at a group space: ________ (how empty? any content?)
- [ ] Mini Apps list: ________ (how many are playable? first impression?)
- [ ] Social Scene / Nearby: ________
- [ ] Push / wheel-spin: ________ (how often does it pop? how many times?)
- [ ] Most annoying thing: ________
- [ ] The one feature most missing: ________
- [ ] One-line summary of how it felt: ________

### 1.3 The opportunity (redefined)
The earlier doc framed the problem as "a dead chat where nobody wants to speak first." That still holds, but it's not enough. The real cold-start problem is:

1. **ZYMIX has low downloads, so many real friends may not be in the app at all.**
2. **If the group chat itself isn't active, an in-chat-only feature is risky.**
3. **An early social app needs something one person can start, and that can pull external friends in.**

So Vibe Dice's opportunity is not "keep the people in the group chatting", but:

> **Let one user start playing, then let WhatsApp / contacts friends interfere with the story, pulling external social ties back into ZYMIX.**

This fits an early app better than pure in-chat icebreaking, because it doesn't depend on a large active user base already existing on the platform.

---

## 2. Competitors & originality

### 2.1 Red ocean to avoid
"AI in the group chat" is crowded. The competitor logic from the earlier doc still holds:
- AI living in the group chat as a member: risks looking like Shapes.
- AI-host party games: if gameplay is pre-baked, it looks like a normal party game.
- Character.AI group chat: leans toward AI-character companionship; human interaction is weaker.
- AI Dungeon: long-form RPG, too heavy, doesn't solve a social app's cold start.

### 2.2 The white space
Vibe Dice's white space is no longer "AI casts humans into a skit", but this chain:

> **Cold chat / solo start → AI generates a micro adventure → dice decide the story's fate → external friends add Fate Cards via a link → AI weaves their interference into the next round → generate a shareable result card → drive friends back into ZYMIX.**

Two key innovations beyond the old Vibe Roles:

1. **Dice-based agency**: the user doesn't passively watch the AI write; they roll to decide success, failure, twists, and costs.
2. **External interference loop**: friends don't need to already be on ZYMIX — they can interfere through a WhatsApp / contacts link.

### 2.3 Demo pitch
Don't say:
> "We built an AI DnD."

Say:
> "We built an AI-native social mini game. It turns a dead chat into a dice story, turns outside friends into story interferers, and lets ZYMIX produce shareable social content even with a tiny user base."

---

## 3. Core gameplay loop

### 3.1 Main loop
1. **Trigger**: when a ZYMIX chat goes cold, a button appears: **Roll to revive this chat**. Users can also open **Vibe Dice** directly from Mini Apps.
2. **AI opening**: the AI generates a micro adventure from the group name, member names, recent vibe, or a preset theme.
3. **Auto role assignment**: the AI gives present members lightweight roles, e.g. The Ghost Rogue / The Snack Healer / The Chaos Bard / The Budget Goblin.
4. **Roll to advance**: the user taps the die. The result decides whether the action fails, partly succeeds, succeeds, or goes absurdly well — and the AI narrates a rich beat (see §3.3).
5. **Share an interference link**: the user can tap **Ask friends to interfere** and send the story link to WhatsApp / contacts / IG DM.
6. **Friends add a Fate Card**: external friends don't need the app — on a web page they add a character, object, curse, world rule, or blessing.
7. **AI weaves it in**: on the next roll, the AI reads the submitted Fate Cards and dramatizes them into the story.
8. **Ending & result card**: after 3 rounds, the AI writes a twist ending and a shareable Quest Card.
9. **Return**: the result card footer says **Start your own Vibe Dice on Zymix**.

### 3.2 Recommended length
- Per run: ~3 minutes.
- Rounds: 3.
- Per round: one roll + at most one choice.
- Friend interference: each friend submits at most 1 Fate Card, to keep the story from spiraling.

### 3.3 Narrative depth — a DND-like conversational story (RULE)
Vibe Dice should feel like a lightweight tabletop RPG run by a great Game Master — a *conversation*, not a slot machine. Even in 3 minutes, the text must carry real story:

- **Rich narration**: each beat is **2–4 vivid sentences** (not a one-word label), with concrete sensory detail, clear stakes, and a hook/cliffhanger at the end.
- **The GM is in-character and reactive**: address players by their role names, and explicitly react to what just happened last beat (continuity with `recent`).
- **Other players speak every round**: 1–2 short in-character lines from the other members each round, so it reads like a group adventure, not a solo roll. (This is a hard requirement — the chat must have multiple voices.)
- **End each beat with a light choice or open question** that invites the next roll or a friend's Fate Card ("Do you trust the pigeon's advice, or run?").
- **Dramatize Fate Cards**: when a friend's card lands, the GM narrates its arrival in-story, not as a bullet point.
- **Tone**: playful, Gen Z, English; PG-safe (no violence/explicit/hate). Keep momentum (3 rounds), but prioritize vivid, connected story over terseness.

Branding caution from §0 still applies (don't market it as DnD), but the internal design target is: **AI Game Master + dice + group dialogue.**

### 3.4 Game Rules — the full turn-based flow (RULE)
The canonical loop, played **inside the group thread** (not a private side game):

1. **Cold trigger.** A group has gone silent for a long time (e.g. 12+ hours). ZYMIX surfaces a prompt in the group: *"This chat has been quiet for a while. Start a DnD-style quest?"* Any member taps **Start**.
2. **Thrilling cold open.** The AI Game Master posts an exciting, high-stakes opening to the group — danger, a mystery, a ticking problem — written as a vivid 2–4 sentence scene (a real hook, not a label). See §3.3.
3. **Role assignment.** The GM casts every present member into a role with a one-line ability, and posts the cast to the group.
4. **Turn order (async-first).** Players act in turn (round-robin by join order); the GM announces whose turn it is. A turn has a ~30s soft timer — if the active player is absent, the GM auto-plays their hero and moves on, so the game never stalls (see §3.5).
5. **Choose an action.** On their turn, the active player is offered **2–3 concrete action options** generated by the AI (or may free-type their own one-line action).
6. **Dice resolves it.** The active player rolls; the 1–20 result maps to a label (Total Chaos … Iconic Roll) that decides success / partial / failure, and the GM narrates the **outcome of that specific action** in 2–4 vivid sentences.
7. **Sync to the group (without spam).** The story syncs to the group as ONE compact, updating quest thread/card (collapsible) — opening, cast, each action, roll + label, narration, reactions — with only a short teaser line in the main chat, so everyone follows along without a message flood (see §3.5).
8. **Loop & raise stakes.** Repeat turns for ~3 rounds, escalating each time. External friends may add Fate Cards that the GM weaves into the next beat.
9. **Climax & ending.** A final roll resolves the climax; the GM writes a twist ending.
10. **Quest Card.** A shareable result card is generated and posted to the group / shared out.

**Per-round state:** `{ activePlayer, actionOptions[], chosenAction, roll, label, narration, reactions[] }`.

**Group-sync principle:** the shared, synced narration *is* the product — it's what revives the chat and pulls lurkers back in. A private single-player roller would not.

### 3.5 Real-human play review — optimizations (RULE)
The §3.4 flow, audited against how real people actually behave in a Gen Z group chat. Seven fixes that keep it playable:

1. **Choice must matter (action = what, dice = how well).** The chosen action decides WHAT is attempted; the dice decides HOW WELL it goes. The GM always ties the outcome to the specific action. On-theme/clever actions grant **Advantage** (roll twice, keep the higher), so smart play is rewarded, not just luck.
2. **Async-first turns, never block.** Real groups aren't all online. A turn has a ~30s soft timer; if the active player doesn't act, the GM auto-plays their hero (as a Sleeping NPC) and moves on. Anyone present can also tap "jump in". No one waits on an absent player.
3. **Don't spam the chat.** Posting 10 messages per round is exactly what ZYMIX users complain about. Render the quest as ONE compact, updating quest card/thread (collapsible), with only a short teaser line in the main chat. Reactions are condensed, not a message flood.
4. **Pacing for skimmers.** Prologue ≤3 short lines; each beat 2–3 tight sentences; reveal progressively and let the user tap to advance (no autoplaying walls of text). Total target stays ~3 minutes.
5. **Tap-first, safe free input.** Default to the 2–3 action buttons (low friction); free-typing is optional. The GM gracefully redirects off-theme or unsafe free input in-story ("the universe resists that…") instead of breaking.
6. **Zero-onboarding.** The Start prompt carries a one-line "how it works" (pick a move → roll → see what happens); the first turn shows a tiny hint. No rules to read.
7. **Opt-in & exit anytime.** Starting a quest is opt-in and never @-pings everyone; any player can leave the quest without leaving the chat, and anyone can tap "wrap it up" to jump to the ending. Length is capped by 3 rounds OR a time box, whichever comes first.

**Multiplayer vs demo:** in the live product each player acts on their own phone for their own turn; the single-screen prototype simulates this on one device. The rules above are written for the real multiplayer behavior.

---

## 4. Dice system

### 4.1 Not a traditional D20 — it's the Vibe Dice
To fit Gen Z tone, don't expose raw numeric rules. The UI can keep 1–20, but result labels use emotional language.

| Number | Result label | Story effect |
|---|---|---|
| 1 | Total Chaos | Critical fail, triggers the most absurd consequence |
| 2–5 | Awkward Fail | Failure, but with a funny twist |
| 6–10 | Messy Progress | Partial success, with a cost |
| 11–15 | Works Somehow | Success, but leaves a problem |
| 16–19 | Main Character Moment | Success, and you gain an edge |
| 20 | Iconic Roll | Huge success, a highlight moment |

### 4.2 Why dice
Dice solve three problems:

1. **Lower performance pressure**: the user doesn't have to think of what to say — one tap advances the story.
2. **Replayability**: the same setup becomes a different story depending on the rolls.
3. **Keeps the AI from being a pure generator**: the AI doesn't dump a full story — it dynamically orchestrates around random fate and friend interference.

---

## 5. Friend interference: Fate Cards

### 5.1 How friends join
After the user taps **Ask friends to interfere**, a share link is generated. Friends open it and see:

> Help or ruin your friend's quest.

They pick one interference type:

1. **Add a Character**
2. **Add an Object**
3. **Add a Curse**
4. **Add a Rule** (world rule)
5. **Add a Blessing**

The friend types one line, e.g.:
> A pigeon wearing sunglasses.

The AI turns it into a structured Fate Card:

```json
{
  "type": "character",
  "title": "The Sunglasses Pigeon",
  "effect": "Appears when the player rolls below 10. It offers suspicious advice but demands chips.",
  "tone": "chaotic but harmless",
  "trigger": "roll_under_10"
}
```

### 5.2 Why Fate Cards (not free story edits)
Letting friends rewrite the story freely would break it and make content unsafe. Fate Cards turn external input into controllable units:

> Friends provide chaos; the AI governs it.

This is also where the AI's value shows: it's not just writing a story — it's doing real-time narrative integration, content filtering, tone unification, and pacing control.

### 5.3 Fate Card whitelist
MVP ships 5 types only:

| Type | Example | Effect |
|---|---|---|
| Character | A jealous duck | Add an NPC |
| Object | A broken umbrella | Give the player an item |
| Curse | Everyone speaks in food metaphors | Add a constraint |
| Rule | Doors only open after bad advice | Change a world rule |
| Blessing | One free escape | Help the player out |

---

## 6. Core user scenarios

### 6.1 Reviving a cold chat
A ZYMIX group chat has gone 20 hours with no messages. The UI shows:

> This chat is getting cold. Roll to revive it?

The user taps, and the AI generates:

> The chat has fallen into silence. A creature called The Unread Beast has stolen the last topic. Roll to recover it.

Member roles:
- Mia: The Overthinking Wizard
- Kai: The Ghost Rogue
- Momo: The Chaos Bard
- You: The Snack Healer

The user rolls; the story advances. If others don't reply for now, the AI can turn them into Sleeping NPCs.

### 6.2 Solo start
If there's no active group on ZYMIX, a user can start alone:

> Start a solo quest.

The AI fills in NPCs, and the user can send the story to WhatsApp to find friends to interfere. This scenario is a must-have for MVP, because it directly solves "low downloads, the group can't get going."

### 6.3 External friend interference
The user sends the link to a WhatsApp friend. The friend doesn't need ZYMIX — they just open the web page:

> Add one twist to your friend's quest.

They submit:
> Everyone can only speak in food metaphors.

The AI turns it into a Fate Card:
> Curse Card: Food Metaphor Mode. All future dialogue must sound like dinner is a psychological condition.

Next round, the AI weaves the curse in.

### 6.4 Sharing the result
At the end:

> **Quest Completed**
> The Unread Beast was defeated.
> Best Interference: Food Metaphor Curse
> Final Roll: 18
> Group Mood: chaotic but alive
> Start your own quest on Zymix.

This card can be shared to ZYMIX content slots, WhatsApp, IG Story, etc.

---

## 7. Degraded modes (anti-fail backbone, must-do)

### 7.1 Not enough people
- 1 person: AI generates a Solo Quest and adds 2 NPCs.
- 2 people: AI adds 1 NPC as a story disruptor.
- 3+ people: normal role assignment.

### 7.2 Group members offline
- Non-responding members become **Sleeping NPCs**.
- When they return they can tap **Re-enter the quest**.
- The AI gives a re-entry beat, e.g.:
  > The Sleeping Oracle has awakened and brings one suspicious prophecy.

### 7.3 Friend won't download the app
- Friends add a Fate Card straight from the web share page.
- No forced download.
- Only after submitting does a light CTA appear:
  > Want to start your own quest? Open Zymix.

### 7.4 API / network failure
- Pre-generate a complete fallback script.
- If Fate Card input fails, use a local mock card.
- The demo must have an offline screen recording ready.

---

## 8. ZYMIX-native integration

| ZYMIX feature | How Vibe Dice uses it |
|---|---|
| Mini Apps (one tap) | Vibe Dice entry point |
| Group spaces | Where a cold chat is revived |
| Social Scene / nearby events | Quests can be framed as "side quests at a real event" |
| Contacts / external share | Bring WhatsApp friends into the interference page |
| Short drama / content slots | Quest Card share outlet |
| Wallet / points | Optional: tip Best Interference / Best Roll |
| Leaderboards | Optional: most chaotic Fate Card / Best Quest Card today |

Key point:
> Vibe Dice doesn't just consume content inside ZYMIX — it lets ZYMIX users pull external friends into a lightweight interactive entry point. That fits an early, low-download state better than a pure in-chat feature.

---

## 9. Technical approach (24h)

### 9.1 Form (architecture decision)
- ✅ **Single-screen simulated web prototype**: pixel-mimic the ZYMIX group chat / Mini App UI.
- ✅ **Share-link interference page**: a standalone page simulating what a WhatsApp friend sees and the Fate Card input flow.
- ✅ **Local state is enough**: store quest, rolls, fate cards in local state / mock store.
- ❌ No real multi-device sync.
- ❌ No real contacts permission.
- ❌ No full DnD rules system.

### 9.2 Stack
- Frontend: Next.js / React single page.
- Fast UI scaffolding: Bolt / Lovable / Cursor.
- AI layer: GLM / Z.ai as primary.
  - Call 1: generate quest opening + role cards + first goal.
  - Call 2: per roll, generate the next beat (narration + member reactions) from the roll result + current Fate Cards.
  - Call 3: turn external friend input into a Fate Card JSON.
  - Call 4: generate the Quest Card text.
- Card export: Fotor template / or a front-end canvas to produce a downloadable card first, with Fotor as the polished marketing output.

### 9.3 Stability trio
- JSON schema constraints.
- Retry on failure.
- Pre-generated fallback script + mock Fate Cards.

### 9.4 Data schema (draft)
```json
{
  "quest_id": "q_001",
  "source": "zymix_group_chat",
  "status": "round_2",
  "scene": { "theme": "The Unread Beast", "setup": "The chat has fallen into silence...", "tone": "chaotic, playful, safe" },
  "players": [
    { "name": "Mia", "role": "The Overthinking Wizard", "ability": "Detect hidden awkwardness", "status": "active" },
    { "name": "Kai", "role": "The Ghost Rogue", "ability": "Return from unread messages", "status": "sleeping_npc" }
  ],
  "rounds": [
    { "round": 1, "roll": 7, "roll_label": "Messy Progress", "narration": "You found the lost topic, but it is cursed." }
  ],
  "fate_cards": [
    { "source_friend": "Maya", "type": "curse", "title": "Food Metaphor Mode", "effect": "All future dialogue must sound like dinner is a psychological condition.", "trigger": "next_round" }
  ],
  "ending": "The Unread Beast was defeated by slow-cooked friendship.",
  "share_card": { "title": "Quest Completed", "caption": "Chaotic but alive", "best_interference": "Food Metaphor Mode", "cta": "Start your own quest on Zymix" }
}
```

---

## 10. 24h time allocation

| Window | Task |
|---|---|
| H0–2 | Setup: Claude Code on GLM, repo, ZYMIX-style UI shell, pick demo theme |
| H2–6 | Core loop: Start Quest → AI opening → role cards → Roll button → first round result |
| H6–10 | Fate Card interference page: share link page + friend input + AI → Fate Card JSON |
| H10–14 | Rounds 2/3: roll result + Fate Card insertion + ending generation |
| H14–17 | Quest Card: result card UI / Fotor template / share button |
| H17–19 | Solo mode + Sleeping NPC + API failure fallback |
| H19–21 | Demo script + recording Plan B + pre-generated perfect data |
| H21–23 | Manus / Fotor / Orbit special-award materials |
| H23–24 | Devpost submission + link checks + buffer |

Priority:
1. Roll + AI story loop
2. WhatsApp interference page
3. Quest Card
4. ZYMIX UI polish
5. Special-award materials

---

## 11. Special-award hooks

### 11.1 Fotor Marketing Award
- In-product: the Quest Card uses a Fotor-style template.
- Marketing asset: a poster — "Your group chat is dead. Roll to revive it."
- Plus a story post showing the chain: WhatsApp friend adds a curse → AI weaves it in → result card.

### 11.2 Manus Real-World Use Case Award
Use Manus to run:
- Competitor research: AI Dungeon / party games / AI chatbots / group chat games.
- Fate Card type library generation.
- Gen Z tone library generation.
- Demo script and Devpost copy.

Keep task links and output screenshots.

### 11.3 Z.ai × Orbit Award
- GLM as the primary model for story generation, Fate Card structuring, and result-card copy.
- Orbie observes the whole coding process.
- Commit frequently.
- Archive first-hand ZYMIX screenshots under `evidence/zymix-firsthand/` (also build-in-public evidence).
- At the end run `capture my persona` and upload to orbit24.uk.

---

## 12. 3-minute demo script (aligned to the official "product + thinking + why it belongs")

> Official wording: judges want to see "your product, your thinking, and why it belongs in the ZYMIX world", scored on a vibes test ("something ZYMIX users would actually open"). So **open with first-hand experience, then why it belongs, then the product**.

### 0:00–0:30 First-hand experience + real pain point (use your post-download ZYMIX screenshots)
Don't lead with stats. Tell it as a real user (distil from §1.2.1):
> e.g. "I signed up for ZYMIX, opened a group space — empty. Few Mini Apps were actually playable. The first night I got hit by wheel-spin promos several times. The strongest feeling: nobody knows what to say first."
(Images: empty group state / Mini Apps list / wheel-spin popup, from `evidence/zymix-firsthand/`.)

### 0:30–0:45 Why it belongs in ZYMIX
> "ZYMIX wants to be a Gen Z social SuperApp, but what it most lacks early on is a lightweight entry one person can start that also pulls external friends in. Vibe Dice is exactly that — it should be one of the Mini Apps. Not another chatbot, but turning silence into a 3-minute dice adventure that even non-downloaders can shape via WhatsApp."

### 0:45–1:10 One-tap start
Tap **Roll to revive this chat** → AI generates the opening (The Unread Beast steals the last topic) + assigns roles (Overthinking Wizard / Ghost Rogue / Chaos Bard / Snack Healer).

### 1:10–1:35 First roll
roll = 7 → Messy Progress: "You found the topic, but it's cursed and needs outside chaos." → the **Ask friends to interfere** button appears.

### 1:35–2:00 WhatsApp friend interferes
Switch to the share link page → friend types "Everyone can only speak in food metaphors" → AI generates **Curse Card: Food Metaphor Mode**.

### 2:00–2:30 Second roll + weaving in the interference
Back in ZYMIX, roll = 18 → Main Character Moment; the AI weaves the curse in, the beast dissolves into a bowl of noodles.

### 2:30–2:45 Result card
Quest Card pops (Best Interference: Food Metaphor Mode / chaotic but alive / Start your own quest on Zymix) → save & share.

### 2:45–3:00 Impact + path to ship
> One user is enough to start; the story spreads via WhatsApp; external friends join without downloading; the Quest Card pulls them back to ZYMIX. Path to ship: launch as a ZYMIX Mini App, reusing its group spaces / share slots / wallet points.

### Plan B
- Pre-generate the whole chain.
- If the API dies, play the perfect recording.
- Keep mock input on the Fate Card page.

---

## 13. Risk mitigation

| Risk | Mitigation |
|---|---|
| Mistaken for a DnD clone | Don't call it DnD; pitch "AI dice micro quest" |
| Story too thin or too long | Cap at 3 rounds, but each beat is 2–4 vivid sentences (§3.3) |
| Friend input goes off the rails | Fate Card type whitelist + content filter |
| User doesn't want to perform | User only rolls; no long typing required |
| Members offline | Sleeping NPC + solo mode |
| Few ZYMIX users | External WhatsApp interference page, no forced download |
| LLM format breaks | JSON schema + fallback |
| API timeout | Pre-generated demo script + offline recording |
| Content safety | Theme whitelist; ban adult/violence/hate/sensitive-identity attacks |

---

## 14. Submission checklist

- [ ] Devpost main submission: team name / members / main track (Vibe with ZYMIX) / project title / product brief / why it matters to ZYMIX users / which AI tools were used
- [ ] Live demo link
- [ ] Plan B recording link
- [ ] Fotor result card / marketing poster link
- [ ] Manus workflow link + notes
- [ ] Orbit package uploaded to orbit24.uk
- [ ] All links open in a no-login browser window
- [ ] Submit before 12:00, leave buffer

---

## 15. Devpost short product brief (draft)

**Vibe Dice is an AI-native dice storytelling mini game for ZYMIX. When a group chat goes cold, one user can start a 3-minute quest. An AI Game Master assigns playful roles, dice rolls decide the story's fate, the group reacts in character, and friends outside ZYMIX can interfere through WhatsApp by adding characters, curses, objects, or rules. AI turns those interventions into Fate Cards and weaves them into the next round. At the end, the game generates a shareable Quest Card that brings the moment back to ZYMIX.**

**Why it matters:** early social apps often feel empty because users don't know what to say first. Vibe Dice makes one user enough to start a social moment, while external sharing turns non-users into playful participants before asking them to download anything.

---

## 16. Implementation status
The repo is a working Vibe Dice prototype (Next.js + GLM + Zod + offline fallback). Build the experience to match §3.3 (rich, DND-like, multi-voice narration). Known time-boxed items: Sleeping NPC "re-enter" UI, optional Wallet/Leaderboard hooks, and real Fotor integration (currently PNG export fallback).
