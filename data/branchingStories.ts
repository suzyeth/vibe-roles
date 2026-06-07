/**
 * branchingStories.ts — story-tree scripts for the branching game model.
 *
 * Unlike the flat per-round `testStories` (one good/bad line per round), a
 * branching story is a graph of NODES. The human ("You") is the protagonist:
 * at each node they pick a choice, roll a D20, and the success/fail of that
 * roll routes to a different next node — so choices genuinely shape the path
 * and the run reads as one connected story. AI members are flavour (reactions),
 * they don't fork the tree.
 *
 * Authoring shape (kept tight so it's writable for all 4 themes):
 *  - ~6 story nodes + ~3 endings per story.
 *  - Each node: one cohesive scene (2-3 sentences) + 2 choices.
 *  - Each choice routes onSuccess (roll 11+) / onFail (roll 10-) to a node id.
 *  - A node id that exists in `endings` terminates the story.
 *
 * English copy, UK Gen-Z flavour, "chaotic but harmless" — matches the app.
 */

export interface BranchChoice {
  label: string;
  emoji?: string;
  /** Next node id on a successful roll (D20 >= 11). */
  onSuccess: string;
  /** Next node id on a failed roll (D20 <= 10). */
  onFail: string;
}

export interface BranchNode {
  id: string;
  /** The cohesive scene narration shown as ONE block when this node opens. */
  scene: string;
  /** 2-3 choices for the protagonist. */
  choices: BranchChoice[];
}

export interface BranchEnding {
  id: string;
  /** Final narration block. */
  scene: string;
  title: string;
  caption: string;
}

export interface BranchingStory {
  key: string;
  theme: string;
  emoji: string;
  tone: string;
  setup: string;
  goal: string;
  roles: Record<string, { role: string; ability: string; detail: string }>;
  defaultRole: { role: string; ability: string; detail: string };
  /** One cohesive opening block (replaces the choppy multi-line prologue). */
  intro: string;
  /** Global gossip pool — AI members rotate through these as flavour. */
  reactions: string[];
  /** Where the story begins. */
  start: string;
  nodes: Record<string, BranchNode>;
  endings: Record<string, BranchEnding>;
  cta: string;
}

export const BRANCHING_STORIES: BranchingStory[] = [
  // ─── 1. Group Chat on Trial (template) ─────────────────────────────────────
  {
    key: "group-chat-trial",
    theme: "Group Chat on Trial",
    emoji: "📱",
    tone: "chaotic but harmless",
    setup:
      "Someone screenshotted the private flat chat into the whole year group. 47 unread, a poll with your name on it, and a leaker hiding in plain sight.",
    goal: "Clear your name and unmask the leaker before the chat folds for good.",
    roles: {
      You: { role: "The Accused", ability: "Somehow always left on read", detail: "Swears it wasn't you. The receipts disagree, loudly." },
      Mia: { role: "The Main Character", ability: "Cries on cue, films it for the Story", detail: "Every crisis is content. Tears optional but always available." },
      Kai: { role: "The Receipts Keeper", ability: "Has every screenshot since Year 9", detail: "Archives everything in a folder ominously named 'evidence'." },
      Momo: { role: "The Peacemaker", ability: "Types 'guys can we not' a lot", detail: "Just wants peace. Will absolutely fail to get it." },
    },
    defaultRole: { role: "The Lurker", ability: "Online but never types", detail: "Read every message. Replied to exactly none." },
    intro:
      "3:47am. The private flat chat is loose in the whole year group, there's a poll with your name on it, and the replies are bare. You are The Accused — you've got until the chat folds to clear your name and find who leaked it.",
    reactions: [
      "the AUDACITY",
      "screenshotting this fr 📸",
      "guys can we not 😭",
      "not the paragraphs 💀",
      "this is going on my Story",
      "it's giving guilty",
      "i said what i said x",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "The accusation lands and forty-seven people go quiet at once, waiting to see how you'll react. Every second you don't reply, the silence types your guilt for you.",
        choices: [
          { label: "Stay calm, ask for proof", emoji: "🧊", onSuccess: "calm", onFail: "messy" },
          { label: "Clap back immediately", emoji: "🔥", onSuccess: "bold", onFail: "messy" },
        ],
      },
      calm: {
        id: "calm",
        scene:
          "Your composure throws the room — people expected a meltdown and got a shrug. A few lurkers quietly switch to your side, and the real leaker starts to look twitchy.",
        choices: [
          { label: "Quietly DM the suspect", emoji: "🕵️", onSuccess: "corner", onFail: "chaos" },
          { label: "Call a flat-wide vote", emoji: "🗳️", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      bold: {
        id: "bold",
        scene:
          "You came in loud and the chat is electric — half horrified, half here for it. It's working, but you're one wrong word from becoming the villain of your own story.",
        choices: [
          { label: "Drop a counter-screenshot", emoji: "📸", onSuccess: "corner", onFail: "chaos" },
          { label: "Name a suspect outright", emoji: "🎯", onSuccess: "chaos", onFail: "chaos" },
        ],
      },
      messy: {
        id: "messy",
        scene:
          "It got away from you — paragraphs, a typo everyone screenshotted, and now two people are allied against you. The chat smells blood and it's pointed your way.",
        choices: [
          { label: "Damage control, fast", emoji: "🩹", onSuccess: "corner", onFail: "chaos" },
          { label: "Go offline dramatically", emoji: "🚪", onSuccess: "chaos", onFail: "chaos" },
        ],
      },
      corner: {
        id: "corner",
        scene:
          "A cropped screenshot gives the leaker away — cropping, as everyone now agrees, IS lying. You've got them cornered; the whole chat is watching what you do with it.",
        choices: [
          { label: "Post the final receipt", emoji: "🧾", onSuccess: "cleared", onFail: "fizzle" },
          { label: "Offer them a truce", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
        ],
      },
      chaos: {
        id: "chaos",
        scene:
          "It's fully feral now — three side-chats, a screenshot of a screenshot, and nobody sober enough to stop it. There's one narrow window to turn the mood before the flat splits for good.",
        choices: [
          { label: "Salvage it with one joke", emoji: "😂", onSuccess: "truce", onFail: "fizzle" },
          { label: "Burn the whole thing down", emoji: "🔥", onSuccess: "fizzle", onFail: "fizzle" },
        ],
      },
    },
    endings: {
      cleared: {
        id: "cleared",
        scene:
          "You post the final receipt with no caption. The leaker types… stops… goes offline. Forty-seven people exhale at once — you're cleared, and the chat will be telling this story for weeks.",
        title: "Name Cleared",
        caption: "receipts up, leaker down",
      },
      truce: {
        id: "truce",
        scene:
          "Nobody fully wins, but one well-timed line breaks the tension and the flat decides it'd rather stay friends than be right. Messy peace, but peace.",
        title: "Messy Peace",
        caption: "the flat survived, barely",
      },
      fizzle: {
        id: "fizzle",
        scene:
          "Nobody admits anything, half the group mutes the chat, and yet somehow everyone's still here at 3am sending memes. Unresolved, toxic, weirdly loyal.",
        title: "Left On Read",
        caption: "no verdict, just vibes",
      },
    },
    cta: "Start your own group drama on Zymix",
  },

  // ─── 2. The Ring Light Goes Dark ───────────────────────────────────────────
  {
    key: "ring-light-goes-dark",
    theme: "The Ring Light Goes Dark",
    emoji: "💡",
    tone: "chaotic but harmless",
    setup:
      "Your flatmate's 200k-follower brunch empire is collapsing live on stream. The comments smell blood and the brand deals are pulling out.",
    goal: "Save the channel (or its dignity) before brunch cancels it for good.",
    roles: {
      You: { role: "The Manager", ability: "Drafts the Notes-app apology", detail: "Holds the brand together with vibes and a Notes app." },
      Mia: { role: "The Influencer", ability: "Can cry and contour at once", detail: "200k followers, zero chill, immaculate lighting." },
      Kai: { role: "The Editor", ability: "Knows what got cut and why", detail: "Knows where every body is buried in the timeline." },
      Momo: { role: "The Brand Rep", ability: "Holds the cheque, for now", detail: "Smiles politely while the cheque visibly trembles." },
    },
    defaultRole: { role: "The Hater", ability: "First in every comment section", detail: "Comments 'L' before the video even finishes loading." },
    intro:
      "The brunch is plated, the ring light's on, and her 200k followers are watching the meltdown happen live. Brand deals are going quiet in real time. You are The Manager — save the channel, or at least its dignity.",
    reactions: [
      "unfollowing rn",
      "the fall from grace 😭",
      "not the Notes app apology 💀",
      "brand deal is GONE",
      "screen recording for the tea page",
      "it's giving cancelled",
      "we love an accountability arc x",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "The comments are scrolling faster than anyone can read and a brand rep is typing the word 'unfortunately'. You've got about ten seconds to decide how this meltdown gets remembered.",
        choices: [
          { label: "Push her live to own it", emoji: "🎤", onSuccess: "live", onFail: "messy" },
          { label: "Post a Notes-app apology", emoji: "📝", onSuccess: "apology", onFail: "messy" },
        ],
      },
      live: {
        id: "live",
        scene:
          "She owns the whole thing in thirty unscripted seconds and — plot twist — the comments actually soften. The momentum is briefly, miraculously, yours.",
        choices: [
          { label: "Pull up the analytics live", emoji: "📊", onSuccess: "corner", onFail: "chaos" },
          { label: "Announce a charity stream", emoji: "💚", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      apology: {
        id: "apology",
        scene:
          "The apology lands… mostly. The tea pages are squinting at it, but the diehards have started rallying in the replies.",
        choices: [
          { label: "Drop a docu-style storytime", emoji: "🎬", onSuccess: "corner", onFail: "chaos" },
          { label: "Collab with a bigger creator", emoji: "🤝", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      messy: {
        id: "messy",
        scene:
          "Two fonts. TWO. The screenshot is already a tea-page countdown and the editor — who has every raw file — is giving you a very particular look.",
        choices: [
          { label: "Damage-control livestream", emoji: "🩹", onSuccess: "corner", onFail: "chaos" },
          { label: "Turn the comments off", emoji: "🙊", onSuccess: "chaos", onFail: "chaos" },
        ],
      },
      corner: {
        id: "corner",
        scene:
          "You trace the original 'leak' to a rival tea page and you've got the receipts. One clean post could flip the entire narrative in your favour.",
        choices: [
          { label: "Post the proof", emoji: "🧾", onSuccess: "uncancelled", onFail: "smaller" },
          { label: "Soft-launch the comeback", emoji: "🚀", onSuccess: "comeback", onFail: "smaller" },
        ],
      },
      chaos: {
        id: "chaos",
        scene:
          "The lore is expanding faster than the follower count is shrinking. There's one pivot left before the brand walks for good.",
        choices: [
          { label: "Pivot niche + thank the haters", emoji: "🌱", onSuccess: "comeback", onFail: "smaller" },
          { label: "Do a full tell-all", emoji: "🎙️", onSuccess: "smaller", onFail: "smaller" },
        ],
      },
    },
    endings: {
      uncancelled: {
        id: "uncancelled",
        scene:
          "You post the proof clean, the comments apologise in bulk, and the brand quietly re-signs the cheque. The ring light glows back on like nothing ever happened.",
        title: "Un-Cancelled",
        caption: "the ring light flickers back on",
      },
      comeback: {
        id: "comeback",
        scene:
          "The comeback stream peaks at 40k live and a bigger creator duets her supportively. She's trending — the good kind, for once.",
        title: "Comeback Arc",
        caption: "trending on purpose this time",
      },
      smaller: {
        id: "smaller",
        scene:
          "Followers dip by twelve thousand, but the ones who stayed are unhinged in the best way. Smaller, feral, loyal.",
        title: "Smaller But Feral",
        caption: "lost the numbers, kept the diehards",
      },
    },
    cta: "Start your own creator saga on Zymix",
  },

  // ─── 3. Locked In at Honeycomb ─────────────────────────────────────────────
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
    intro:
      "The clock hit zero, then started counting up, and the door clicked itself locked. Staff aren't answering the intercom and the walls feel a few inches closer than before. You are The Sceptic — find the real way out before the room resets again.",
    reactions: [
      "nope nope nope",
      "did anyone else hear that",
      "i want to go HOME",
      "why is it counting up now 😨",
      "do NOT split up",
      "guys the torch is at 4%",
      "i'm filming for evidence x",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "The intercom just plays your own knock back at you, a half-second late. Everyone's looking at you to decide the next move before the timer ticks up again.",
        choices: [
          { label: "Search for a hidden latch", emoji: "🔦", onSuccess: "draft", onFail: "trapped" },
          { label: "Read the clue on the wall", emoji: "📜", onSuccess: "draft", onFail: "trapped" },
        ],
      },
      draft: {
        id: "draft",
        scene:
          "Behind the bookcase: a thin draft of cold, outside air and a seam the set designers definitely never painted. A way out — maybe.",
        choices: [
          { label: "Smash the two-way mirror", emoji: "🪞", onSuccess: "keys", onFail: "loop" },
          { label: "Follow the cold draft", emoji: "💨", onSuccess: "keys", onFail: "loop" },
        ],
      },
      trapped: {
        id: "trapped",
        scene:
          "The keypad takes your code, beeps approvingly, then silently changes it. The room is learning your moves and playing them back at you.",
        choices: [
          { label: "Crawl through the vent", emoji: "🌀", onSuccess: "keys", onFail: "loop" },
          { label: "Reset the puzzle on purpose", emoji: "♻️", onSuccess: "loop", onFail: "loop" },
        ],
      },
      keys: {
        id: "keys",
        scene:
          "The vent drops you into the empty staff room — no people, but the master keys are right there on the hook, swinging slightly.",
        choices: [
          { label: "Try the final lock", emoji: "🗝️", onSuccess: "out", onFail: "haunted" },
          { label: "Trace the wiring first", emoji: "🔌", onSuccess: "out", onFail: "haunted" },
        ],
      },
      loop: {
        id: "loop",
        scene:
          "The door swings open onto the very first room again, the candle still lit exactly as you left it. You've been here before. Keep your nerve.",
        choices: [
          { label: "Keep nerve, find the hatch", emoji: "🧊", onSuccess: "out", onFail: "stuck" },
          { label: "Smash straight through the wall", emoji: "🧱", onSuccess: "haunted", onFail: "stuck" },
        ],
      },
    },
    endings: {
      out: {
        id: "out",
        scene:
          "You haul the last door open and there it is — streetlights, drizzle, the ordinary kind of cold. You actually made it out of Honeycomb.",
        title: "Out of Honeycomb",
        caption: "five stars, would not return",
      },
      haunted: {
        id: "haunted",
        scene:
          "You're out, soaked and laughing too loudly — but someone keeps glancing back at the door like it might start counting again.",
        title: "Out, Mostly",
        caption: "nobody's looking at the door",
      },
      stuck: {
        id: "stuck",
        scene:
          "The countdown resets one last time and the lights rearrange the room around you. Honeycomb isn't quite done with you yet.",
        title: "Still Inside",
        caption: "the room kept the receipts",
      },
    },
    cta: "Start your own escape on Zymix",
  },

  // ─── 4. Two Texts, One Group Chat ──────────────────────────────────────────
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
    intro:
      "You typed 'I think I like you' and sent it to the group chat — the one with your ex in it. It's ticked blue, three people are typing, and the unsend button is greyed out and laughing at you. You are The Wrong-Chat Texter.",
    reactions: [
      "WHO was that for 👀",
      "the ex is typing oh my days",
      "haha (what does haha mean)",
      "i KNEW it x",
      "screenshot sent to the gc gc",
      "this is better than telly",
      "delulu is the solulu",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "Three dots from the ex. Three dots from the situationship. Three dots from your best friend. Everyone's waiting to see whether you commit or crumble.",
        choices: [
          { label: "Double down romantically", emoji: "💘", onSuccess: "bold", onFail: "spiral" },
          { label: "Claim it was a typo", emoji: "🙈", onSuccess: "typo", onFail: "spiral" },
        ],
      },
      bold: {
        id: "bold",
        scene:
          "You double down with one devastating line and the situationship — who only ever sends 'haha' — replies with a full sentence. Real, terrifying movement.",
        choices: [
          { label: "Ask the best friend for intel", emoji: "🕵️", onSuccess: "close", onFail: "triangle" },
          { label: "Plan a 'casual' hangout", emoji: "☕", onSuccess: "close", onFail: "triangle" },
        ],
      },
      typo: {
        id: "typo",
        scene:
          "Nobody believes 'typo, ignore that lol', and the ex reacts with the laughing emoji — which somehow feels deeply personal.",
        choices: [
          { label: "Make it a group joke", emoji: "😂", onSuccess: "close", onFail: "triangle" },
          { label: "Go mysteriously quiet", emoji: "🌫️", onSuccess: "triangle", onFail: "triangle" },
        ],
      },
      spiral: {
        id: "spiral",
        scene:
          "The ex slides into your DMs 'just to check you're okay'. Now there are two situationships and one extremely tense group chat.",
        choices: [
          { label: "Define the relationship", emoji: "🗣️", onSuccess: "close", onFail: "triangle" },
          { label: "Big romantic gesture", emoji: "🎁", onSuccess: "triangle", onFail: "triangle" },
        ],
      },
      close: {
        id: "close",
        scene:
          "Off the record, the feeling's mutual — a hand brush, a held glance, a silence that says everything. It's giving.",
        choices: [
          { label: "Make it official", emoji: "💍", onSuccess: "official", onFail: "complicated" },
          { label: "Soft-launch it", emoji: "📸", onSuccess: "official", onFail: "complicated" },
        ],
      },
      triangle: {
        id: "triangle",
        scene:
          "Screenshots are flying between three group chats and your love life is officially a spectator sport. One move left to land this.",
        choices: [
          { label: "Pick peace, stay real friends", emoji: "🕊️", onSuccess: "friends", onFail: "complicated" },
          { label: "Let the gc hold a vote", emoji: "🗳️", onSuccess: "complicated", onFail: "complicated" },
        ],
      },
    },
    endings: {
      official: {
        id: "official",
        scene:
          "You make it official, the group chat completely loses it, and even the ex types 'cute x' and means it. Hard launch, 200 likes, friendship intact — a genuinely rare W.",
        title: "Hard Launch",
        caption: "feelings caught, friends kept",
      },
      friends: {
        id: "friends",
        scene:
          "You pick peace over being right, and somehow that's the most romantic thing you've done all night. No label, but the friendship's bulletproof.",
        title: "Chose Peace",
        caption: "no label, all heart",
      },
      complicated: {
        id: "complicated",
        scene:
          "It's unlabelled, unresolved, and everyone's still in the chat at 2am typing 'haha'. Could honestly be worse.",
        title: "Read 23:59",
        caption: "complicated, but online",
      },
    },
    cta: "Start your own situationship saga on Zymix",
  },
];

/** Lookup by theme/key for selectors. */
export const BRANCHING_THEMES = BRANCHING_STORIES.map((s) => s.theme);
