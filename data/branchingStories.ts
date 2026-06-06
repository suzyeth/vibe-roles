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
];

/** Lookup by theme/key for selectors. */
export const BRANCHING_THEMES = BRANCHING_STORIES.map((s) => s.theme);
