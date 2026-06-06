/**
 * testStories.ts — pre-written DRAMA scripts for Test Mode (保底方案).
 *
 * Why this exists: GLM can be slow. Test Mode runs the whole game off these
 * scripts — zero network, zero LLM, instant and deterministic — so a demo never
 * stalls. Content is English, UK Gen-Z flavoured (per project: UI/display is
 * English). Tone stays "chaotic but harmless" to match the rest of the app.
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
      "Group Chat on Trial. 47 unread messages and a poll about you.",
      "Someone leaked the screenshot to the whole year group. The replies are bare.",
      "You are The Accused. Clear your name before the chat folds. Roll to begin.",
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
        good: "You drop one calm voice note and the chat goes dead quiet. Respect, lowkey.",
        bad: "You typed three paragraphs. They left you on read. Gutted.",
        crit: "You quote-tweet the drama with one word: 'anyway'. The group folds. Iconic.",
        flop: "Autocorrect changed 'I swear' to 'I sweat'. Everyone saw. It's over.",
      },
      {
        youOptions: ["Demand the timestamps", "Accuse the quiet one", "Start a private side-chat", "Go offline dramatically"],
        good: "You ask for timestamps and someone's story instantly stops adding up. Sus.",
        bad: "You accused the wrong mate. They've now allied with the enemy. Bad look.",
      },
      {
        youOptions: ["Leak a counter-screenshot", "Call a flat meeting", "Apologise (strategically)", "Blame the group admin"],
        good: "Your counter-screenshot lands. The narrative flips. You're the victim now, allegedly.",
        bad: "Your 'apology' had a 'but' in it. The replies are merciless.",
      },
      {
        youOptions: ["Cross-examine Kai's receipts", "Soft-launch the truth", "Rally the lurkers", "Mute and ghost"],
        good: "You catch a cropped screenshot. Cropping IS lying. The room turns.",
        bad: "You posted, deleted, reposted. They saw the edit. Delulu behaviour.",
      },
      {
        youOptions: ["Name the leaker", "Offer a truce", "Post the final receipt", "Threaten to leave"],
        good: "You drop the final receipt. The leaker types... stops typing... goes offline. Caught.",
        bad: "You named someone and immediately got proven wrong. The group is feral now.",
        crit: "The leaker confesses in an all-caps voice note that cracks halfway. Closure.",
      },
      {
        youOptions: ["Forgive them on Story", "Start a brand new chat", "Demand a public apology", "Just block everyone"],
        good: "The leaker owns it. The flat survives. Barely. It's giving redemption arc.",
        bad: "Nobody admits anything but everyone's still here at 3am. Toxic but loyal.",
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
      "The Ring Light Goes Dark. 200k followers, one very live meltdown.",
      "Brand deals are pulling out and the comments smell blood.",
      "You are The Manager. Save the channel, or its dignity. Roll to begin.",
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
        good: "You go live, own it in 30 seconds, and the comments... actually soften. Witnessed.",
        bad: "The Notes-app apology had two fonts. Two. The tea pages are feasting.",
        crit: "You cry one perfect tear and announce a charity stream. Redemption speedrun.",
        flop: "You typed 'no body is perfect'. No body. The clip is already a sound.",
      },
      {
        youOptions: ["Blame the editor", "Restore the brand deal", "Cry on camera (real)", "Quote the analytics"],
        good: "You show the analytics. Engagement's up. Chaos is content, baby.",
        bad: "You threw the editor under the bus on stream. The editor has the raw files. Oops.",
      },
      {
        youOptions: ["Drop a docu-style storytime", "Collab with a bigger creator", "Turn comments off", "Sell the merch early"],
        good: "The storytime hits the For You page for the right reasons. Sympathy spike.",
        bad: "You turned comments off. Now they're stitching you. It's worse. So much worse.",
      },
      {
        youOptions: ["Expose the real villain", "Soft-launch a comeback", "Refund the brunch", "Beg the sponsor"],
        good: "Plot twist: the 'leak' was a rival page. You post proof. The tide turns hard.",
        bad: "Your comeback teaser used the same audio as the meltdown. People noticed.",
      },
      {
        youOptions: ["Announce the comeback stream", "Hand the brand the cheque back", "Go fully offline", "Do a tell-all"],
        good: "The comeback stream peaks at 40k live. The brand re-signs. The ring light glows again.",
        bad: "The tell-all created three new scandals. Lore expanding. Channel shrinking.",
        crit: "A bigger creator duets you supportively. You're trending. For once it's good.",
      },
      {
        youOptions: ["Thank the haters (genuinely)", "Pivot to a new niche", "Retire at 21", "Start a podcast"],
        good: "You pivot, the algorithm forgives, and brunch is back on the menu. Survived.",
        bad: "Followers down 12k but the diehards stayed. Smaller, feral, loyal.",
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
      "Locked In at Honeycomb. The clock hit zero. Then it started again.",
      "Staff aren't answering. The lock just clicked itself shut.",
      "You are The Sceptic. Find the real exit before the room resets. Roll to begin.",
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
        good: "You find a draft of cold air behind the bookcase. There's a seam. A way out, maybe.",
        bad: "The door's solid. Your knock echoes back a beat too late, like something knocked first.",
        crit: "You spot a maintenance hatch the staff forgot to lock. Genuine exit. Hold that thought.",
        flop: "You pull the 'exit' lever. The lights die. The countdown speeds up. Brilliant.",
      },
      {
        youOptions: ["Follow the cold draft", "Solve the keypad", "Check on the wanderer", "Smash the fake mirror"],
        good: "The mirror's two-way. Behind it: a corridor and a fire-exit sign. Now we're talking.",
        bad: "The keypad accepts your code... then changes it. The room is playing back.",
      },
      {
        youOptions: ["Crawl through the vent", "Reset the puzzle on purpose", "Barricade and wait", "Find the wanderer NOW"],
        good: "The vent drops you into the staff room. Empty. But the keys are right there.",
        bad: "You went to wait it out. The countdown hit zero and the lights came back... rearranged.",
      },
      {
        youOptions: ["Grab the staff keys", "Trace the wiring", "Decode the final riddle", "Just run for it"],
        good: "Keys in hand, the final lock gives. One door left. The cold air is real now.",
        bad: "The keys melt the same shape into every lock. Wrong keys. Or wrong locks.",
      },
      {
        youOptions: ["Open the last door", "Wait for the others", "Disable the countdown", "Smash through the wall"],
        good: "You yank the last door. Streetlights. Rain. The normal kind of cold. You made it out.",
        bad: "The door opens onto the first room again. You've been here before. Keep your nerve.",
        crit: "The exit opens AND the staff come running, horrified. It wasn't supposed to do that.",
      },
      {
        youOptions: ["Get everyone out", "Go back for the wanderer", "Tell the staff everything", "Never speak of it"],
        good: "Headcount's right. Everyone's out, soaked and laughing too loud. Survived Honeycomb.",
        bad: "You're out. Mostly. Someone keeps glancing at the door like it might count again.",
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
      "Two Texts, One Group Chat. You typed 'I think I like you' in the WRONG chat.",
      "It's ticked blue. Three people are typing. One of them is your ex.",
      "You are The Wrong-Chat Texter. Save the friendship and the feelings. Roll to begin.",
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
        good: "You double down with one smooth line and the situationship sends a real reply. Movement.",
        bad: "You said 'typo'. Everyone knows. The ex reacted with the laughing emoji. Cold.",
        crit: "You own it completely and the right person replies 'finally'. The chat GASPS.",
        flop: "You tried to unsend the wrong message and deleted your own birthday plans. Chaos.",
      },
      {
        youOptions: ["Slide into the DMs", "Make it a group joke", "Ask the best friend for intel", "Go mysteriously quiet"],
        good: "The best friend confirms the feeling's mutual. Insider trading, but make it romance.",
        bad: "The ex slid in first. Now there are two situationships and one very tense chat.",
      },
      {
        youOptions: ["Plan a 'casual' hangout", "Confront the ex kindly", "Soft-launch the crush", "Deny under oath"],
        good: "The casual hangout becomes a not-casual moment. Hand brush. Eye contact. It's giving.",
        bad: "Your soft-launch was a hard reveal. The ex screenshotted it to THEIR gc. Spiralling.",
      },
      {
        youOptions: ["Define the relationship", "Let the ex have closure", "Big romantic gesture", "Run away to your nan's"],
        good: "You actually have the conversation. Words like 'feelings' are used. Growth, allegedly.",
        bad: "The grand gesture peaked too early. Now it's awkward AND public. Menty b incoming.",
      },
      {
        youOptions: ["Make it official", "Stay friends (real this time)", "Pick neither, pick peace", "Ask the gc to vote"],
        good: "You and the right person make it official. The gc loses it. Even the ex says 'cute x'.",
        bad: "You let the chat vote. The poll tied. Democracy has failed your love life.",
        crit: "Soft launch becomes hard launch. Matching pfps by midnight. The ick never stood a chance.",
      },
      {
        youOptions: ["Hard launch on Story", "Keep it private (for once)", "Throw a flat party", "Block the drama, keep the love"],
        good: "Hard launch. 200 likes. The situationship is now a relationship. Friendship intact. Rare W.",
        bad: "It's complicated but everyone's still in the chat, still typing 'haha'. Could be worse.",
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
