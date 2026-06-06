# Vibe Roles — Product Design Doc (DESIGN.md)

> VibeHack London 2026 · Track 2 "Vibe with ZYMIX" — design source of truth
> Continuing revision of the earlier "Vibe Roles / Vibe Dice" docs
> Engineering reference: SPEC.md (note: SPEC.md predates this revision — reconcile its naming/dice labels to this doc).
> Last updated: 2026-06-06

## 0. One-line positioning

**A ZYMIX-native cold-group-revival mini game: when a group chat has been quiet for a while, a lightweight prompt appears inside the chat. If one person taps to start, the AI randomly generates a DND-like group adventure and auto-assigns every member a role. Members act on the AI-generated story and action options — or type their own continuation / extra action in the chat box — and roll a die to resolve outcomes. Every roll affects the ongoing story and the relationships between characters, ending in a shareable result card.**

Differentiation line (say it first in the demo):
> "We're not another always-on chatbot, and we're not a full DND. We turn a quiet group chat into a lightweight AI adventure, so people don't have to awkwardly find a topic to start talking again."

Short name: **Vibe Roles**
Feature mode: **Quest Mode / Roll to Revive**

> Note: when explaining, you may say "a DND-like group adventure", but don't define the product AS DND — DND makes people think it's a complex RPG system. The point isn't rule completeness; it's using roles, actions, dice resolution, and AI narration to bring a dead chat back to life.

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

### 1.3 Opportunity: reconnecting a quiet group chat

ZYMIX's opportunity isn't just "make a fun AI mini game" — it's solving the very common cold-group problem in an early social app.

Many Gen Z chats aren't long-term communities; they form around a temporary connection: a class, an exhibition, a project, a trip, a meal, or just a "buddy" relationship. They can be lively for a while, but once the shared event ends, the topic runs out, or nobody wants to speak first, they go quiet fast.

The problem usually isn't that people don't want to talk — it's that the cost of speaking up again is high. Nobody wants to be the one who suddenly messages out of nowhere, and nobody knows what topic could revive the group.

Vibe Roles's opportunity:

> **Don't ask the user to find a topic — let the AI give the group a reason to interact again via a lightweight role adventure.**

When a group chat has had no new messages for ~72 hours, a non-intrusive prompt can appear inside the chat:

> "This group's been quiet for a while. Want to start a mini adventure?"

It doesn't block normal chatting and it's not a push notification — it's just a persistent, lightweight entry point. The moment any member taps Start, the AI randomly generates a story background and auto-assigns roles. Members can pick actions for their role, or type a custom continuation / intervention in the chat box, and resolve with a die.

Vibe Roles does NOT analyze the group's past messages. It only triggers on the inactivity state, then randomly generates a brand-new story world. This lowers the privacy burden and makes the feature feel like a light mini game, not a chat-monitoring/summarizing AI tool.

So restarting the chat is no longer:
> "I have to awkwardly find a topic."

It becomes:
> "I'm just doing one action as my character in a story."

---

## 2. Competitors & originality

### 2.1 Red ocean to avoid
"AI in the group chat" is crowded. The competitor logic still holds:
- AI living in the chat as a member: risks looking like Shapes.
- AI-host party games: if gameplay is pre-baked, it looks like a normal party game.
- Character.AI group chat: leans toward AI-character companionship; human interaction is weaker.
- AI Dungeon: long-form RPG, too heavy, doesn't solve a social app's cold start.

### 2.2 The white space
Vibe Roles's white space is neither "always-on AI chat" nor "fixed-script mini game", but this chain:

> **Cold-group prompt → one person starts → AI randomly generates story + roles → players intervene with actions → dice resolution → results persist and shape later story → characters affect each other → external friends interfere (time-limited) → AI integrates everything → shareable ending card.**

The key: the AI doesn't just write a story — it maintains a *changing group narrative state*. Every player action, dice result, and external intervention changes what happens next.

### 2.3 Demo pitch
Don't say:
> "We built an AI DND."

Say:
> "We built an AI-native social mini game. It turns a quiet chat into a playable random story where character actions and dice results genuinely change what happens next, and time-limited external interference pulls friends from outside the app in."

---

## 3. Core gameplay loop

### 3.1 Trigger: a light cold-group prompt
When a ZYMIX chat has had no new messages for ~72 hours, a lightweight prompt appears in the chat:
> "This group's been quiet for a while. Want to start a mini adventure?"

It's not a popup, doesn't block the input box, and never force-pings. It can pin to the top of the chat or sit after the last message as a persistent small entry. If nobody taps it, it just stays; people can keep chatting normally. It should feel like a small system entry, not an intrusive notification.

The moment any member taps **Start the adventure**, the game begins.

**Recommended trigger: 72 hours.** A week is too long — for many Gen Z temporary/buddy/project/event groups, a week of silence means people already consider the group over. 72 hours feels like "this group's gone a bit quiet, but the connection isn't dead yet" — the right moment to break the ice.

### 3.2 AI randomly generates story & roles
On start, the AI generates this run's story live — not from a fixed script, and without reading chat history. It only needs:
- that the group has been quiet,
- how many members there are,
- the names of the members currently joining,
- that the run should finish in ~3 minutes.

From that, the AI randomly generates: story type, scene/location, the core crisis, each member's role, each role's initial task, the first round of actions, and hidden clues / potential conflicts.

This is *controlled* randomness — within a safe theme whitelist, a light time budget, and member-count limits — so every run starts, advances, and ends quickly. The same group, next time, might enter a totally different scene, e.g.:
- a space station oxygen-system failure
- lost at Tube platform 404
- a late-night convenience store stuck in a loop
- a mysterious order in the dorm kitchen
- someone at a party gets a text from the future

The AI also assigns each member a different role. Roles aren't a fixed job list — they're generated for this run's story and tied to its crisis. E.g. in the convenience-store story: Delivery Driver / Lost Student / Store Manager / CCTV-room Operator / the 404th Customer. In a space-station story the same person might next be: Commander / Rookie Astronaut / Oxygen Engineer / Missing Scientist / Hatch Mechanic.

To keep identity clear, each member's current role name shows under their avatar. So in chat you see not only "who's talking" but "who they are in the story."

The point of randomness isn't complexity — it's replayability. Every time a quiet group is revived, members enter a different temporary world with a new identity and a new reason to interact.

### 3.3 Random generation ≠ a one-shot script
The AI does NOT generate the full ending at the start — only the current frame, the role relationships, and the first situation. The story then changes continuously based on player actions, dice results, custom inputs, and external interference.

So each run's development is decided by three things together:
1. **The AI's random opening** — this run's world, crisis, and roles.
2. **Player actions + dice resolution** — whether each role succeeds in changing the situation.
3. **External friends' time-limited interference** — adds events, info, settings, or constraints.

Even if two groups draw a similar scene, role assignment + dice + interference send them to completely different endings.

### 3.4 Member actions: AI generates targeted options per role & story
Each round, the AI generates a set of targeted action options for each player, based on the current scene, the role, prior dice results, clues already surfaced, and the relationships between characters.

Users never see categories like "generic options" vs "role-specific options" — every option appears naturally inside the story, so the player feels they're deciding as their character, not operating a system menu. E.g. in the convenience-store anomaly:
- Store Manager might see: check the register log / open the staff door / call the other customers / grab something to defend with
- Delivery Driver: check the order address / call the previous customer / look in the van's boot / scout the route outside
- Lost Student: find the exit sign / check the phone map / ask where the sound came from / hide behind the shelves
- Doctor: check the others' condition / judge the air / find the first-aid kit / ask if anyone's hallucinating

Besides tapping an AI option, the user can type a custom action or story intervention in the chat box, e.g.:
> "I hide behind the shelves and try to overhear where the voice is coming from."

The AI treats it as a character action and proceeds to dice resolution.

### 3.5 Dice resolution: results change later story
After a player chooses an action or types a custom intervention, the system prompts a roll. The roll doesn't just judge "success/failure" of the current action — it produces a consequence that keeps affecting later story.

After each roll the AI must record at least one story consequence, e.g.:
- a new clue found
- a location's status changed
- a character gains/loses an item
- a character is suspected / hurt / trapped / trusted
- a new link or conflict between two characters
- next round's options change
- the ending condition advances or breaks

Example:
> Kai picks "photograph the video", D20 = 15, success. The AI doesn't just say "Kai succeeds" — it generates a lasting consequence: the photo shows Kai has now seen this clip for the 72nd time. This shapes later story: Kai may know repeated clues, Luna may start believing the video is wrong, others may suspect Kai of hiding info.

Or:
> Luna picks "refuse to believe the video", D20 = 8, fail. Consequence: the video keeps playing and shows Luna doubting it — making Luna more likely to become the system's suspect later, and others start watching her.

### 3.6 Characters affect each other
The core isn't each player completing their own action independently — it's each character's action affecting others. After each round the AI integrates everyone's results into a new group situation, e.g.:
- one character opened a door → others can enter the new area next round
- one character's failure tripped an alarm → everyone is in more danger next round
- one character found a clue → but the clue may point at another character
- one character's custom action changed a story rule → others must now act under it
- an external friend's event changes everyone's situation at once

That's what makes roles meaningful: players aren't taking turns tapping buttons — they're co-shaping a story system where actions interact.

### 3.7 AI integration: from single rolls to continuous narrative
After each round the AI integrates: the current scene, each role's identity, each player's action, dice results, surfaced clues/consequences, relationship changes, and external interventions — then generates the next story beat and new options for the next player(s).

So the story isn't independent text snippets — it's a continuously updated narrative state. The previous round's success, failure, misunderstanding, clue, and interference all become conditions for the next.

### 3.8 External friends' time-limited interference: invite disappears after 5 minutes
During play, members can tap share to send the current adventure to friends outside the app (e.g. WhatsApp or contacts). External friends don't need to download ZYMIX — they can add one intervention factor, e.g. a sudden event, a mysterious message, a new character, an object, a world rule, or a constraint.

The external invite is NOT a permanent link — it's a **time-limited intervention invite that exists for only 5 minutes**. After 5 minutes the invite disappears from view, like recalling a WeChat message or deleting a WhatsApp message.

Inside ZYMIX, the invite card can simply vanish from the chat. On external platforms (WhatsApp etc.), the demo can simulate: after 5 minutes, opening the invite shows "This invitation has disappeared", and the friend can no longer access the intervention entry. The production version implements this per each platform's message capabilities.

The goal isn't ongoing intrusion — it's a brief, light, time-sensitive participation window. If the friend joins in time, their input is turned into a temporary intervention and woven into the next round. If not, the invite auto-disappears and doesn't clutter the conversation.

External friends never see the original group chat — only the AI-generated story situation and the current intervention entry.

### 3.9 Ending card
When the story ends, the AI generates an ending card with: this run's title, the best story moment, each character's final status, the most pivotal dice result, the most fun external intervention, and the group's final mood.

It can be shared to ZYMIX content slots, WhatsApp, IG Story, RED, or TikTok. What's shared isn't the full chat log — it's the highlights and ending summary, like a "group highlight card" that turns this reconnection into a saveable, shareable social memory.

---

## 4. Dice system

### 4.1 D20 resolution, lightweight rules
The UI can keep D20 phrasing, e.g. "D20 = 1: the action fails, things get more complicated." / "D20 = 15: success, you find a new clue." Dice exist to create randomness, tension, and participation — not a full RPG ruleset. Users don't write long passages; they pick an action, type one line, or tap the die.

| Roll | Result label | Story effect |
|---|---|---|
| 1 | Critical Fail | Big failure, triggers a severe but safe consequence |
| 2–5 | Fail | The action fails, the situation gets more complex |
| 6–10 | Partial Progress | Some progress, but with a cost |
| 11–15 | Success | The action succeeds, gain a clue or change the scene |
| 16–19 | Strong Success | Success plus an advantage, affecting other characters |
| 20 | Critical Success | Huge success, a highlight moment or twist |

### 4.2 Why dice
1. **Lower performance pressure**: the user doesn't have to think of what to say — one tap advances the story.
2. **Replayability**: the same setup becomes a different story depending on the rolls.
3. **Keeps the AI from being a pure generator**: it orchestrates around random fate, player actions, and external interference.

---

## 5. External intervention

### 5.1 How friends join
Tapping share generates a 5-minute time-limited invite. The friend sees only a short situation of the current AI story world, not the original chat. They add one intervention factor, e.g.:
> "A mysterious anonymous text suddenly appears, saying someone's behind the register."
or:
> "Every door auto-locks whenever someone lies."

The AI turns it into a structured intervention and weaves it into the next round or a later fitting moment.

### 5.2 Intervention isn't a direct story edit
External friends can't rewrite the story directly (it would break the plot and content safety). They only provide one intervention factor; the AI judges its type, strength, trigger timing, and impact on relationships.
> Friends provide chaos; the AI governs it.

This is where the AI's value shows: not just writing, but real-time narrative integration, content filtering, tone unification, and pacing control.

### 5.3 External intervention type whitelist
MVP ships 6 types:

| Type | Example | Effect |
|---|---|---|
| Event | An alarm suddenly blares | Change the current situation |
| Message | Receive an anonymous text | Provide new information |
| Character | The 404th customer appears | Add an NPC |
| Object | A key that opens no door | Give the player an item |
| Rule | Doors auto-lock when someone lies | Change a world rule |
| Condition | Must leave the room within 5 minutes | Add a constraint |

### 5.4 Reward for the intervener
If an external friend successfully submits an intervention, after the story ends they can see: the full ending summary, which round their intervention appeared in, what impact it had, and an "intervention contribution card".

So the friend isn't just a one-tap helper — they become a co-author of this run. They'll naturally want to know:
> "That setting I added — what did the story actually become in the end?"

---

## 6. Core user scenarios

### 6.1 Reviving a cold group
A ZYMIX group has gone 72 hours with no messages. The prompt appears:
> "This group's been quiet for a while. Want to start a mini adventure?"

The user taps, and the AI randomly generates:
> A late-night convenience store suddenly disconnects from the outside world; the register reads "Welcome, customer #404."

Roles:
- Luna: Delivery Driver
- Jake: Lost Student
- Kai: Store Manager
- Alex: Investigator
- Emma: CCTV-room Operator

Each avatar shows its role name. The AI generates Act 1; members take turns picking actions, typing interventions, and rolling to push the story.

### 6.2 Solo / few-player start
If only one person taps Start, it can still begin. The AI sets unresponsive people as Sleeping NPCs, or temporarily generates NPCs to join — so a cold group isn't blocked just because others are offline.

### 6.3 External friend interference
The user sends the 5-minute invite to a WhatsApp friend, who adds:
> "Every character receives a text from their future self."

The AI weaves it in:
> Next round, each character gets a different future text — and one of them is clearly lying.

This affects every character's next options and the trust between them.

### 6.4 Sharing the result
At the end:
> **Quest Completed**
> This run: Customer #404
> Most pivotal roll: Kai D20 = 15, found the loop evidence
> Best external intervention: a text from your future self
> Group's final mood: chaotic but alive again
> Start your own Vibe Roles on Zymix

---

## 7. Degraded modes (anti-fail backbone, must-do)

### 7.1 Not enough people
- 1 person: AI generates a Solo Quest and adds 2 NPCs.
- 2 people: AI adds 1 NPC as a story disruptor.
- 3+ people: normal role assignment.

### 7.2 Members offline
- Non-responding members become **Sleeping NPCs**.
- They can tap **Re-enter the quest** when they return.
- The AI gives a re-entry beat, e.g.: "The Sleeping Oracle has awakened and brings one suspicious prophecy."

### 7.3 Friend won't download the app
- Friends submit one intervention straight from the web share page.
- No forced download.
- Only after submitting does a light CTA appear: "Want to start your own quest? Open Zymix."

### 7.4 API / network failure
- Pre-generate a complete fallback script.
- If external intervention input fails, use a local mock intervention.
- The demo must have an offline screen recording ready.

---

## 8. ZYMIX-native integration

| ZYMIX feature | How Vibe Roles uses it |
|---|---|
| Mini Apps (one tap) | Vibe Roles / Quest Mode entry |
| Group spaces | Where a cold group is revived |
| Social Scene / nearby events | Quests can be framed as "side quests at a real event" |
| Contacts / external share | Bring WhatsApp friends into the time-limited intervention page |
| Short drama / content slots | Ending-card share outlet |
| Wallet / points | Optional: tip Best Intervention / Best Roll |
| Leaderboards | Optional: most chaotic external intervention / Best Quest Card today |

Key point:
> Vibe Roles doesn't just consume content inside ZYMIX — it lets ZYMIX users pull external friends into a lightweight interactive entry. That fits an early, low-download state better than a pure in-chat feature.

---

## 9. Technical approach (24h)

### 9.1 Form (architecture decision)
- ✅ **Single-screen simulated web prototype**: pixel-mimic the ZYMIX group chat / Mini App UI.
- ✅ **Time-limited intervention page**: a standalone page simulating the WhatsApp-friend intervention flow.
- ✅ **Local state is enough**: store quest, rolls, interventions in local state / mock store.
- ❌ No real multi-device sync.
- ❌ No real contacts permission.
- ❌ No full DND rules system.
- ❌ No reading of chat history.

### 9.2 Stack
- Frontend: Next.js / React single page.
- Fast UI scaffolding: Bolt / Lovable / Cursor.
- AI layer: GLM / Z.ai as primary.
  - Call 1: randomly generate quest opening + role cards + first-round goals.
  - Call 2: from player action + dice result + current story state, generate the next beat.
  - Call 3: turn external friend input into a structured intervention.
  - Call 4: generate the ending-card copy.
- Card export: Fotor template / or a front-end canvas first, with Fotor as the polished marketing output.

### 9.3 Stability trio
- JSON schema constraints.
- Retry on failure.
- Pre-generated fallback script + mock interventions.

### 9.4 Data schema (draft)
```json
{
  "quest_id": "q_001",
  "source": "zymix_group_chat",
  "status": "round_2",
  "generation": {
    "mode": "random_story_generation",
    "uses_chat_history": false,
    "trigger": "group_inactive_72_hours",
    "member_count": 5,
    "theme": "random_from_safe_theme_pool",
    "role_generation_mode": "random_but_story_relevant"
  },
  "scene": {
    "theme": "The 404 Customer",
    "setup": "A convenience store has disconnected from the outside world...",
    "tone": "chaotic, playful, safe"
  },
  "players": [
    { "name": "Kai", "role": "Store Manager", "ability": "Knows the store layout", "status": "active", "inventory": ["store keys"], "trust": {"Luna": 0, "Jake": 1} },
    { "name": "Luna", "role": "Delivery Driver", "ability": "Knows the outside route", "status": "active", "inventory": [], "trust": {"Kai": -1} }
  ],
  "story_state": {
    "known_clues": ["the receipt says customer 404"],
    "location_status": { "front_door": "locked", "staff_corridor": "unknown" },
    "character_status": { "Kai": "has_loop_evidence", "Luna": "suspected_by_system" },
    "relationships": ["Luna starts doubting Kai after seeing the repeated video."],
    "active_consequences": ["camera footage may reveal previous loops"]
  },
  "rounds": [
    { "round": 1, "actor": "Kai", "action": "take a photo of the video", "roll": 15, "roll_label": "Success", "consequence": "Kai gains evidence that he has seen this video 72 times." }
  ],
  "external_interventions": [
    { "source_friend": "Maya", "type": "message", "title": "Future Self Text", "effect": "Every character receives a different message from their future self.", "trigger": "next_round", "expires_after_minutes": 5, "visibility": "disappearing_invitation" }
  ],
  "ending": "The group escapes by discovering which future message was lying.",
  "share_card": { "title": "Quest Completed", "caption": "Chaotic but alive", "best_interference": "Future Self Text", "cta": "Start your own Vibe Roles on Zymix" }
}
```

---

## 10. 24h time allocation

| Window | Task |
|---|---|
| H0–2 | Setup: Claude Code on GLM, repo, ZYMIX-style UI shell, pick demo theme |
| H2–6 | Core loop: cold prompt → Start Quest → AI random opening → role cards → first-round options |
| H6–10 | Action + D20 resolution + consequence storage + next-round story-state update |
| H10–13 | Time-limited intervention page: share entry + 5-minute disappear logic + input → structured intervention |
| H13–16 | Rounds 2/3: dice results + intervention insertion + characters affecting each other |
| H16–18 | Ending card UI / Fotor template / share button |
| H18–20 | Solo mode + Sleeping NPC + API failure fallback |
| H20–22 | Demo script + recording Plan B + pre-generated perfect data |
| H22–24 | Devpost / Manus / Fotor / Orbit materials & submission |

Priority:
1. Cold prompt + one-person start
2. Random story & role assignment
3. Character actions + D20 resolution + downstream effects
4. External time-limited intervention
5. Ending card
6. ZYMIX UI polish

---

## 11. Special-award hooks

### 11.1 Fotor Marketing Award
- In-product: the ending card uses a Fotor-style template.
- Marketing asset: a poster — "Your group chat is quiet. Start a mini adventure."
- Plus a story post showing the chain: cold prompt → AI random story → external friend time-limited interference → ending card.

### 11.2 Manus Real-World Use Case Award
Use Manus to run: competitor research (AI Dungeon / party games / AI chatbots / group chat games), a random story-theme library, a role library, a Gen Z tone library, the demo script and Devpost copy. Keep task links and output screenshots.

### 11.3 Z.ai × Orbit Award
- GLM as the primary model for story generation, role generation, dice-result narration, intervention structuring, and ending-card copy.
- Orbie observes the whole coding process.
- Commit frequently.
- At the end run `capture my persona` and upload to orbit24.uk.

---

## 12. 3-minute demo script

### 0:00–0:25 pain point
Show a dead ZYMIX chat:
> 3 days, no messages. Nobody wants to be the first person to speak.

Then the differentiation line:
> "We're not adding another chatbot to the group. We turn a quiet chat into a mini AI adventure, where roles are random, actions are judged by dice, and every result changes what happens next."

### 0:25–0:50 cold prompt
A small prompt appears in the chat:
> "This group's been quiet for a while. Want to start a mini adventure?"
Tap: **Start the adventure**.

### 0:50–1:15 AI random story & roles
AI generates:
> A late-night convenience store suddenly disconnects from the outside world; the register reads "Welcome, customer #404."
Roles: Luna = Delivery Driver, Jake = Lost Student, Kai = Store Manager, Alex = Investigator, Emma = CCTV-room Operator. Role names show under avatars.

### 1:15–1:45 first action + dice
Kai picks: "photograph the video". Roll: D20 = 15.
> Success. The photo shows Kai has now seen this clip for the 72nd time. This evidence shifts how others trust Kai.

### 1:45–2:10 external time-limited intervention
Tap: **Invite a friend to interfere**. Switch to the external page with a 5-minute countdown. Friend types:
> Everyone receives a text from their future self.
> This invitation will disappear in 5 minutes.

### 2:10–2:40 round 2: the intervention affects everyone
Back in ZYMIX, the AI weaves it in:
> Every character gets a future text, but one is clearly lying. Luna starts doubting Kai; Jake finds his text mentions an exit that doesn't exist.
Players keep choosing actions and rolling.

### 2:40–3:00 ending card
> **Quest Completed**
> Story: Customer #404
> Most pivotal roll: Kai D20 = 15
> Best intervention: a text from your future self
> Group's final mood: chaotic but alive again
> Start your own Vibe Roles on Zymix

Closing line:
> Vibe Roles makes one quiet group enough to start a social moment, without reading chat history or forcing users to come up with a topic.

---

## 13. Risk mitigation

| Risk | Mitigation |
|---|---|
| Mistaken for a DND clone | Don't call it DND; pitch cold-group revival + AI micro adventure |
| Story too long | Fixed ~3 rounds, ≤2 narration sentences per round |
| Users don't want to perform | Users only pick an action, type a short line, or roll |
| Disconnected action results | Use `story_state` to track clues, relationships, consequences, location status |
| Friend input goes off the rails | Intervention type whitelist + content filter |
| Members offline | Sleeping NPC + solo mode |
| Few ZYMIX users | External time-limited intervention page, no forced download |
| Chat-history privacy risk | Don't read chat history — only detect the inactivity state |
| Invite keeps bugging external friends | 5-minute disappearing invite |
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

**Vibe Roles is an AI-native mini adventure for ZYMIX group chats. When a group goes quiet for around 72 hours, a small prompt appears inside the chat: "This group has been quiet for a while. Start a mini adventure?" If one person starts it, AI randomly generates a short story world and assigns each member a role. Players choose actions or type their own interventions, then roll a D20 to decide whether their actions succeed. Every result changes the ongoing story state, affects other characters, and shapes the final ending.**

**The feature does not read chat history. It only detects that the group has been inactive, then creates a new shared event for the group. Users can also send a 5-minute disappearing invite to external friends, who can add a temporary event, message, character, object, rule or condition to interfere with the story. At the end, AI generates a shareable ending card with the best moment from the adventure.**

**Why it matters:** many Gen Z groups form around temporary connections — classmates, project partners, travel groups, activity friends, food buddies, or casual circles. These groups often go quiet not because people stopped caring, but because nobody wants to restart the conversation. Vibe Roles turns that awkward restart into a light, playable moment.
