/**
 * testStories.ts — pre-written DRAMA scripts for Test Mode (保底方案).
 *
 * Why this exists: GLM can be slow. Test Mode runs the whole game off these
 * scripts — zero network, zero LLM, instant and deterministic — so a demo never
 * stalls. Content is English, UK Gen-Z flavoured (per project: UI/display is
 * English). Tone stays "chaotic but harmless" to match the rest of the app.
 *
 * Narration is written to read like a continuous story: each outcome is 2
 * sentences — a vivid beat plus a fresh complication/hook — so the run feels
 * like a drama, not a list of one-liners.
 *
 * Shape notes:
 * - `roles` keys should cover the preset members (Mia, Kai, Momo, You). Any
 *   name not listed falls back to a default role in the engine.
 * - `beats` are indexed by round (the engine clamps past the last beat).
 * - `reactions` is a story-wide gossip pool; the engine rotates through it per
 *   turn so the chat keeps roasting without per-beat authoring.
 * - Narration branches on the roll: `good` for 11+ (Success or better), `bad`
 *   for 10-; optional `crit` (nat 20) and `flop` (nat 1) for extra spice.
 */

export interface TestBeat {
  /** Action choices shown on a human ("You") turn at this beat. */
  youOptions: string[];
  /** Narration when the roll lands 11+ (success-ish). */
  good: string;
  /** Narration when the roll lands 10 or under (fail-ish). */
  bad: string;
  /** Optional flavour on a natural 20. */
  crit?: string;
  /** Optional flavour on a natural 1. */
  flop?: string;
}

export interface TestStory {
  key: string;
  theme: string;
  emoji: string;
  tone: string;
  setup: string;
  goal: string;
  /** name -> role + ability + a one-line character detail. Keys: Mia, Kai, Momo, You. */
  roles: Record<string, { role: string; ability: string; detail: string }>;
  /** Role given to any member not named in `roles`. */
  defaultRole: { role: string; ability: string; detail: string };
  /** 1–3 prologue lines, streamed at the start. */
  prologue: string[];
  /** Story-wide group-chat reactions, rotated per turn by the engine. */
  reactions: string[];
  /** Indexed by round; the engine clamps to the last beat if it overruns. */
  beats: TestBeat[];
  ending: { title: string; caption: string; cta: string };
}

export const TEST_STORIES: TestStory[] = [
  // ─── 1. Social 修罗场 ──────────────────────────────────────────────────────
  {
    key: "group-chat-trial",
    theme: "Group Chat on Trial",
    emoji: "📱",
    tone: "chaotic but harmless",
    setup:
      "Someone screenshotted the private flat chat and dropped it in the whole year group. 47 unread. None of them are nice.",
    goal: "Find who leaked the screenshot before the group chat folds for good.",
    roles: {
      You: { role: "The Accused", ability: "Somehow always left on read", detail: "Swears it wasn't you. The receipts disagree, loudly." },
      Mia: { role: "The Main Character", ability: "Cries on cue, films it for the Story", detail: "Every crisis is content. Tears optional but always available." },
      Kai: { role: "The Receipts Keeper", ability: "Has every screenshot since Year 9", detail: "Archives everything in a folder ominously named 'evidence'." },
      Momo: { role: "The Peacemaker", ability: "Types 'guys can we not' a lot", detail: "Just wants peace. Will absolutely fail to get it." },
    },
    defaultRole: { role: "The Lurker", ability: "Online but never types", detail: "Read every message. Replied to exactly none." },
    prologue: [
      "📱 3:47am. Forty-seven unread, a poll with your name on it, and a screenshot of the private flat chat now loose in the whole year group.",
      "Every notification is one more person picking a side. The replies are bare and the typing dots won't stop.",
      "You are The Accused. You've got until the chat folds to find the leaker and clear your name. Roll to begin.",
    ],
    reactions: [
      "the AUDACITY",
      "screenshotting this fr 📸",
      "guys can we not 😭",
      "not the paragraphs 💀",
      "this is going on my Story",
      "left on read is wild",
      "it's giving guilty",
      "i said what i said x",
    ],
    beats: [
      {
        youOptions: ["Deny everything, calmly", "Post a cryptic Story", "Send one voice note", "Screenshot the screenshot"],
        good: "You send one calm 9-second voice note and the chat goes dead silent — the kind of silence that means people are screenshotting it to send elsewhere. For the first time tonight you're not the one on the back foot.",
        bad: "You fire back three paragraphs with a 'to be clear' wedged in the middle. Two grey ticks. Left on read, and the lurkers definitely saw it happen.",
        crit: "You quote-reply the entire saga with one word — 'anyway' — and lock your replies. The group implodes trying to decode it; somehow you're the calm main character now.",
        flop: "Autocorrect turns 'I swear I didn't' into 'I sweat I didn't'. Four people have already saved the clip and someone's added a caption. It's so over.",
      },
      {
        youOptions: ["Demand the timestamps", "Accuse the quiet one", "Start a private side-chat", "Go offline dramatically"],
        good: "You ask, very politely, for timestamps — and within seconds one person's version of events stops lining up with the times on their own screenshots. The chat notices, and the smell of blood changes direction.",
        bad: "You point the finger at the quiet one, loudly and wrongly. They post proof they were asleep, then DM the actual leaker to team up against you.",
      },
      {
        youOptions: ["Leak a counter-screenshot", "Call a flat meeting", "Apologise (strategically)", "Blame the group admin"],
        good: "You drop a counter-screenshot that reframes the whole night, and just like that the story flips — you're the victim now, allegedly, and the replies start apologising to you.",
        bad: "Your 'apology' has a 'but' bolted onto the end of it. The room reads it in real time and the paragraph-essays come back twice as long.",
      },
      {
        youOptions: ["Cross-examine Kai's receipts", "Soft-launch the truth", "Rally the lurkers", "Mute and ghost"],
        good: "You zoom in on a screenshot nobody else checked and catch the crop — and cropping, as everyone now agrees, IS lying. The lurkers finally start typing, and they're on your side.",
        bad: "You post, delete, then repost a slightly nicer version. The 'edited' tag gives you away instantly, and now even your allies look unsure.",
      },
      {
        youOptions: ["Name the leaker", "Offer a truce", "Post the final receipt", "Threaten to leave"],
        good: "You post the final receipt with no caption and let it sit. The leaker starts typing… stops… starts again… then goes offline. The whole chat watched it happen. Caught.",
        bad: "You name a name with total confidence and get proven wrong inside thirty seconds. The group turns feral and now there are two polls about you.",
        crit: "The leaker cracks and confesses in an all-caps voice note that breaks halfway through. Forty-seven people exhale at once. Closure, finally.",
      },
      {
        youOptions: ["Forgive them on Story", "Start a brand new chat", "Demand a public apology", "Just block everyone"],
        good: "The leaker owns it publicly, you forgive them with one screenshot-proof line, and the flat chat survives — barely, but it survives. It's giving redemption arc.",
        bad: "Nobody actually admits anything, but somehow everyone's still here at 3am sending memes. Toxic, unresolved, weirdly loyal.",
      },
    ],
    ending: {
      title: "Case Closed (Sort Of)",
      caption: "the flat survived, the screenshots did not",
      cta: "Start your own group drama on Zymix",
    },
  },

  // ─── 2. 网红塌房 / Influencer cancellation ─────────────────────────────────
  {
    key: "ring-light-goes-dark",
    theme: "The Ring Light Goes Dark",
    emoji: "💡",
    tone: "chaotic but harmless",
    setup:
      "Your flatmate's 200k-follower brunch empire is collapsing live on stream. The comments smell blood and the brand deals are pulling out.",
    goal: "Save the channel (or its dignity) before it gets fully cancelled by brunch.",
    roles: {
      You: { role: "The Manager", ability: "Drafts the Notes-app apology", detail: "Holds the brand together with vibes and a Notes app." },
      Mia: { role: "The Influencer", ability: "Can cry and contour at once", detail: "200k followers, zero chill, immaculate lighting." },
      Kai: { role: "The Editor", ability: "Knows what got cut and why", detail: "Knows where every body is buried in the timeline." },
      Momo: { role: "The Brand Rep", ability: "Holds the cheque, for now", detail: "Smiles politely while the cheque visibly trembles." },
    },
    defaultRole: { role: "The Hater", ability: "First in every comment section", detail: "Comments 'L' before the video even finishes loading." },
    prologue: [
      "💡 The ring light is on, the brunch is plated, and your flatmate's 200k-follower empire is melting down live in front of all of them.",
      "Brand deals are quietly pulling out and the comment section can smell blood from a mile off.",
      "You are The Manager. Save the channel — or at least its dignity — before brunch cancels it for good. Roll to begin.",
    ],
    reactions: [
      "unfollowing rn",
      "the fall from grace 😭",
      "not the Notes app apology 💀",
      "this is so embarrassing actually",
      "brand deal is GONE",
      "screen recording for the tea page",
      "it's giving cancelled",
      "we love an accountability arc x",
    ],
    beats: [
      {
        youOptions: ["Post a Notes-app apology", "Go live and explain", "Delete everything", "Pin a sponsored post anyway"],
        good: "You push her live, she owns the whole thing in thirty unscripted seconds, and — plot twist — the comments actually soften. Someone types 'ok the accountability is kinda fire'.",
        bad: "The Notes-app apology goes up in two different fonts. TWO. The tea pages screenshot it before you can fix the kerning and start a countdown to the next one.",
        crit: "She sheds one perfect, professionally-lit tear and pivots into a surprise charity stream. The redemption speedrun is trending before the brunch goes cold.",
        flop: "The caption reads 'no body is perfect'. No body. It's already a sound, and three creators have used it before you finish reading the comments.",
      },
      {
        youOptions: ["Blame the editor", "Restore the brand deal", "Cry on camera (real)", "Quote the analytics"],
        good: "You pull the analytics up on stream — engagement's spiking — and reframe the chaos as content. Suddenly the meltdown looks like a strategy nobody can prove wasn't one.",
        bad: "You throw the editor under the bus on a live mic, forgetting the editor still has every raw file. A folder named 'BTS' starts to feel like a threat.",
      },
      {
        youOptions: ["Drop a docu-style storytime", "Collab with a bigger creator", "Turn comments off", "Sell the merch early"],
        good: "The moody, well-lit storytime lands on the For You page for the right reasons this time. Sympathy spikes and the diehards start defending her in every reply.",
        bad: "You turn the comments off and the internet takes it personally — now they're stitching her instead, and the stitches are meaner than the comments ever were.",
      },
      {
        youOptions: ["Expose the real villain", "Soft-launch a comeback", "Refund the brunch", "Beg the sponsor"],
        good: "Twist: the 'leak' traces back to a rival tea page, and you post the proof clean. The narrative whiplashes and the comments start apologising in bulk.",
        bad: "The comeback teaser accidentally reuses the exact audio from the meltdown. People notice in under a minute and the irony becomes the new story.",
      },
      {
        youOptions: ["Announce the comeback stream", "Hand the brand the cheque back", "Go fully offline", "Do a tell-all"],
        good: "The comeback stream peaks at 40k live, the brand quietly re-signs the cheque, and the ring light glows back to life like nothing ever happened.",
        bad: "The tell-all answers one scandal and births three more. The lore expands; the follower count does not.",
        crit: "A much bigger creator duets her supportively and the whole thing flips into a feel-good moment. She's trending — for once, the good kind.",
      },
      {
        youOptions: ["Thank the haters (genuinely)", "Pivot to a new niche", "Retire at 21", "Start a podcast"],
        good: "She pivots niche, genuinely thanks the haters by name, and the algorithm forgives everything. Brunch is back on the menu and so is she.",
        bad: "Followers dip by twelve thousand, but the ones who stayed are unhinged in the best way. Smaller, feral, loyal.",
      },
    ],
    ending: {
      title: "Un-Cancelled (For Now)",
      caption: "the ring light flickers back on",
      cta: "Start your own creator saga on Zymix",
    },
  },

  // ─── 3. 震惊 / 密室恐怖 — Escape-room horror ───────────────────────────────
  {
    key: "honeycomb-escape",
    theme: "Locked In at Honeycomb",
    emoji: "🔒",
    tone: "tense but harmless",
    setup:
      "The 60-minute escape room hit zero ten minutes ago. The staff aren't answering. The countdown just... restarted. The walls feel closer.",
    goal: "Find the real exit before the room resets one more time.",
    roles: {
      You: { role: "The Sceptic", ability: "Refuses to panic (out loud)", detail: "Insists it's all staged. Voice slightly too high to believe." },
      Mia: { role: "The Screamer", ability: "Hears it first, every time", detail: "Sensible — right up until the lights flicker. Then not." },
      Kai: { role: "The Puzzle Guy", ability: "Cracks any lock, slowly", detail: "Will solve the lock. Eventually. Probably. Stay calm." },
      Momo: { role: "The Torch Bearer", ability: "Last phone with battery", detail: "Guards the final 4% of phone battery with their life." },
    },
    defaultRole: { role: "The One Who Wandered Off", ability: "Always one room ahead", detail: "Never where you left them. Always one room ahead." },
    prologue: [
      "🔒 The 60-minute escape room hit zero ten minutes ago. Then the timer blinked, reset itself, and started counting up.",
      "Staff aren't answering the intercom, the door clicked itself locked, and the walls feel a few inches closer than before.",
      "You are The Sceptic. Find the real way out before the room resets one more time. Roll to begin.",
    ],
    reactions: [
      "nope nope nope",
      "did anyone else hear that",
      "i want to go HOME",
      "why is it counting up now 😨",
      "do NOT split up",
      "this isn't part of the game right",
      "guys the torch is at 4%",
      "i'm filming for evidence x",
    ],
    beats: [
      {
        youOptions: ["Bang on the exit door", "Search for a hidden latch", "Read the clue on the wall", "Call the front desk again"],
        good: "Behind the bookcase you feel a thin draft of cold, outside air — and your fingers find a seam in the wall the set designers definitely didn't paint. A way out, maybe.",
        bad: "Your knock on the exit door echoes back a half-second too late, like something on the other side knocked first. The door doesn't budge.",
        crit: "You spot a maintenance hatch the staff forgot to lock, tucked behind a fake fire extinguisher. A genuine, boring, beautiful exit. Hold that thought.",
        flop: "You yank the lever marked EXIT and the lights die instantly. When they flicker back, the countdown is moving faster. Brilliant work.",
      },
      {
        youOptions: ["Follow the cold draft", "Solve the keypad", "Check on the wanderer", "Smash the fake mirror"],
        good: "The mirror's two-way — behind it runs a service corridor with an actual fire-exit sign glowing at the far end. Now you're getting somewhere.",
        bad: "The keypad accepts your code, beeps approvingly… then silently changes it. The room is learning your moves and playing them back.",
      },
      {
        youOptions: ["Crawl through the vent", "Reset the puzzle on purpose", "Barricade and wait", "Find the wanderer NOW"],
        good: "The vent drops you straight into the empty staff room. No people — but the master keys are sitting right there on the hook, swinging slightly.",
        bad: "You decide to wait it out. The countdown hits zero, the lights cut, and when they return the furniture has been quietly rearranged.",
      },
      {
        youOptions: ["Grab the staff keys", "Trace the wiring", "Decode the final riddle", "Just run for it"],
        good: "Keys in hand, the final lock gives with a satisfying clunk. One door left between you and the street, and the cold air leaking under it is real now.",
        bad: "Every key melts the same shape into every lock you try. Wrong keys — or, worse, wrong locks. The room hums like it's amused.",
      },
      {
        youOptions: ["Open the last door", "Wait for the others", "Disable the countdown", "Smash through the wall"],
        good: "You haul the last door open and there it is: streetlights, drizzle, the ordinary kind of cold. You actually made it out of Honeycomb.",
        bad: "The door swings open onto the very first room again, the candle still lit exactly as you left it. You've been here before. Keep your nerve.",
        crit: "The exit opens AND the staff come sprinting round the corner, white-faced — because that door was never supposed to open from the inside.",
      },
      {
        youOptions: ["Get everyone out", "Go back for the wanderer", "Tell the staff everything", "Never speak of it"],
        good: "Headcount checks out and everyone spills onto the pavement, soaked and laughing far too loudly. You survived Honeycomb — five stars, would not return.",
        bad: "You're out — mostly. But someone keeps glancing back at the door like it might start counting again, and nobody's brave enough to say it won't.",
      },
    ],
    ending: {
      title: "Out of Honeycomb",
      caption: "we do not recommend the 5-star reviews",
      cta: "Start your own escape on Zymix",
    },
  },

  // ─── 4. 狗血恋爱 / Melodrama romance ───────────────────────────────────────
  {
    key: "two-texts-one-chat",
    theme: "Two Texts, One Group Chat",
    emoji: "💔",
    tone: "chaotic but harmless",
    setup:
      "You sent 'I think I like you' to the wrong person in the group chat. It's ticked blue. Three people are typing.",
    goal: "Survive the love triangle without losing the friendship or the situationship.",
    roles: {
      You: { role: "The Wrong-Chat Texter", ability: "Fastest unsend in the West (too slow)", detail: "Sent feelings to the group chat. Cannot unsend feelings." },
      Mia: { role: "The Ex", ability: "Still has notifications on", detail: "Moved on, allegedly. Notifications stay firmly on." },
      Kai: { role: "The Situationship", ability: "Replies 'haha' to everything", detail: "Replies 'haha'. Could mean anything. Means nothing." },
      Momo: { role: "The Best Friend", ability: "Knew before you did", detail: "Knew before you did. Has the screenshots to prove it." },
    },
    defaultRole: { role: "The Witness", ability: "Watching it all unfold, popcorn ready", detail: "Said nothing, saw everything. Popcorn fully ready." },
    prologue: [
      "💔 You typed 'I think I like you' — and sent it to the wrong chat. The group chat. The one with your ex in it.",
      "It's ticked blue. Three people are typing. The unsend button is greyed out and laughing at you.",
      "You are The Wrong-Chat Texter. Save the friendship and the feelings before the night ends. Roll to begin.",
    ],
    reactions: [
      "WHO was that for 👀",
      "the ex is typing oh my days",
      "haha (what does haha mean)",
      "i KNEW it x",
      "screenshot sent to the gc gc",
      "this is better than telly",
      "delulu is the solulu",
      "say less, i'm invested",
    ],
    beats: [
      {
        youOptions: ["Claim it was a typo", "Double down romantically", "Unsend and pray", "'Who's asking?'"],
        good: "You double down with one smooth, devastating line, and the situationship — who never sends more than 'haha' — sends an actual full sentence back. Movement. Real movement.",
        bad: "You go with 'typo, ignore that lol' and absolutely nobody believes you. The ex reacts with the laughing emoji, which somehow feels deeply personal.",
        crit: "You own it completely, name-drop the right person, and they reply 'finally'. The entire chat gasps in unison; even the lurkers come online for this.",
        flop: "You panic-unsend the wrong message and delete your own birthday plans instead. The 'I think I like you' stays. The confusion only multiplies.",
      },
      {
        youOptions: ["Slide into the DMs", "Make it a group joke", "Ask the best friend for intel", "Go mysteriously quiet"],
        good: "The best friend confirms, strictly off the record, that the feeling is very much mutual. Insider trading, but make it romance.",
        bad: "The ex slides into your DMs first, just to 'check you're okay'. Now there are two situationships and one extremely tense group chat.",
      },
      {
        youOptions: ["Plan a 'casual' hangout", "Confront the ex kindly", "Soft-launch the crush", "Deny under oath"],
        good: "The 'casual' hangout turns distinctly non-casual — a hand brush, a held glance, a silence that says everything. It's giving.",
        bad: "Your soft-launch lands as a hard reveal, and the ex screenshots it straight into THEIR group chat. The saga is now multi-platform.",
      },
      {
        youOptions: ["Define the relationship", "Let the ex have closure", "Big romantic gesture", "Run away to your nan's"],
        good: "You actually have the conversation — out loud, words like 'feelings' included. Terrifying, mature, and apparently it goes well. Growth, allegedly.",
        bad: "The grand gesture peaks about three days too early. Now it's awkward AND public, and a menty b is loading at 99%.",
      },
      {
        youOptions: ["Make it official", "Stay friends (real this time)", "Pick neither, pick peace", "Ask the gc to vote"],
        good: "You and the right person make it official, and the group chat completely loses it. Even the ex types 'cute x' — and means it, mostly.",
        bad: "You let the chat hold a vote and the poll ties exactly down the middle. Democracy has officially failed your love life.",
        crit: "Soft launch becomes hard launch becomes matching pfps by midnight. The ick never stood a chance; the gc is already planning the wedding.",
      },
      {
        youOptions: ["Hard launch on Story", "Keep it private (for once)", "Throw a flat party", "Block the drama, keep the love"],
        good: "Hard launch, 200 likes in an hour, situationship upgraded to relationship — and the friendship somehow survives intact. A genuinely rare W.",
        bad: "It's complicated, unlabelled and unresolved, but everyone's still in the chat at 2am typing 'haha'. Could honestly be worse.",
      },
    ],
    ending: {
      title: "Read 23:59",
      caption: "feelings caught, friendship survived (mostly)",
      cta: "Start your own situationship saga on Zymix",
    },
  },
];

/** All test-story themes, for selectors / validation. */
export const TEST_STORY_THEMES = TEST_STORIES.map((s) => s.theme);
