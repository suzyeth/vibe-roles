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
  /** Story-themed universal actions — the grey "common" option group, shown
   *  alongside each node's role-specific branches. They resolve along the
   *  node's baseline branch. */
  common: string[];
  /** Where the story begins. */
  start: string;
  nodes: Record<string, BranchNode>;
  endings: Record<string, BranchEnding>;
  /** Optional: Role-specific choices per node. Format: roleChoices_<nodeId>: { actorName: choices[] } */
  [key: string]: any; // Allow additional roleChoices_* properties
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
          { label: "Post the final receipt", emoji: "🧾", onSuccess: "bridge_cleared", onFail: "bridge_fizzle" },
          { label: "Offer them a truce", emoji: "🤝", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        ],
      },
      chaos: {
        id: "chaos",
        scene:
          "It's fully feral now — three side-chats, a screenshot of a screenshot, and nobody sober enough to stop it. There's one narrow window to turn the mood before the flat splits for good.",
        choices: [
          { label: "Salvage it with one joke", emoji: "😂", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
          { label: "Burn the whole thing down", emoji: "🔥", onSuccess: "bridge_fizzle", onFail: "bridge_fizzle" },
        ],
      },
      bridge_cleared: {
        id: "bridge_cleared",
        scene:
          "The final receipt is ready — one post ends it. But as your thumb hovers over send, you pause. This isn't just about winning anymore. It's about what kind of flat you want when the dust settles.",
        choices: [
          { label: "Send it, end it clean", emoji: "🧾", onSuccess: "cleared", onFail: "truce" },
          { label: "Hold, give them a chance", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
        ],
      },
      bridge_truce: {
        id: "bridge_truce",
        scene:
          "The truce message is typed out — one click could end the war. But part of you wonders if peace is worth the price of letting it slide. The group chat waits, not breathing.",
        choices: [
          { label: "Send the truce", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
          { label: "Back away, stay unresolved", emoji: "🫥", onSuccess: "fizzle", onFail: "fizzle" },
        ],
      },
      bridge_fizzle: {
        id: "bridge_fizzle",
        scene:
          "The chat's a mess and nobody's winning. You could walk away right now — just mute, disappear, let it all drift into nothing. Or you could try one last time to pull something from the wreckage.",
        choices: [
          { label: "Try one last save", emoji: "😅", onSuccess: "truce", onFail: "fizzle" },
          { label: "Let it fade out", emoji: "🫥", onSuccess: "fizzle", onFail: "fizzle" },
        ],
      },
    },
    /** Role-specific choices for the "calm" node */
    roleChoices_calm: {
      You: [
        { label: "Quietly DM the suspect", emoji: "🕵️", onSuccess: "corner", onFail: "chaos" },
        { label: "Call a flat-wide vote", emoji: "🗳️", onSuccess: "corner", onFail: "chaos" },
      ],
      Mia: [
        { label: "DM them privately", emoji: "💬", onSuccess: "corner", onFail: "chaos" },
        { label: "Story time on live", emoji: "📱", onSuccess: "corner", onFail: "chaos" },
      ],
      Kai: [
        { label: "Check the metadata", emoji: "🔍", onSuccess: "corner", onFail: "chaos" },
        { label: "Reply all in screenshots", emoji: "📸", onSuccess: "corner", onFail: "chaos" },
      ],
      Momo: [
        { label: "Ask everyone to calm down", emoji: "😌", onSuccess: "corner", onFail: "chaos" },
        { label: "Stay out of it", emoji: "🤐", onSuccess: "chaos", onFail: "chaos" },
      ],
    },
    /** Role-specific choices for the "bold" node */
    roleChoices_bold: {
      You: [
        { label: "Drop a counter-screenshot", emoji: "📸", onSuccess: "corner", onFail: "chaos" },
        { label: "Name a suspect outright", emoji: "🎯", onSuccess: "chaos", onFail: "chaos" },
      ],
      Mia: [
        { label: "Double down dramatically", emoji: "😎", onSuccess: "corner", onFail: "chaos" },
        { label: "Post a deflecting selfie", emoji: "🤳", onSuccess: "corner", onFail: "chaos" },
      ],
      Kai: [
        { label: "Post a thread exposing receipts", emoji: "🧵", onSuccess: "corner", onFail: "chaos" },
        { label: "Tag them in a new post", emoji: "🏷️", onSuccess: "chaos", onFail: "chaos" },
      ],
      Momo: [
        { label: "Try to mediate the drama", emoji: "🤝", onSuccess: "corner", onFail: "chaos" },
        { label: "Stay silent and observe", emoji: "🤐", onSuccess: "chaos", onFail: "chaos" },
      ],
    },
    /** Role-specific choices for the "messy" node */
    roleChoices_messy: {
      You: [
        { label: "Damage control, fast", emoji: "🩹", onSuccess: "corner", onFail: "chaos" },
        { label: "Go offline dramatically", emoji: "🚪", onSuccess: "chaos", onFail: "chaos" },
      ],
      Mia: [
        { label: "Apologize on main chat", emoji: "😅", onSuccess: "corner", onFail: "chaos" },
        { label: "Go offline, fake drama", emoji: "🎭", onSuccess: "chaos", onFail: "chaos" },
      ],
      Kai: [
        { label: "Delete and pretend hacked", emoji: "🗑️", onSuccess: "corner", onFail: "chaos" },
        { label: "Blame technical issues", emoji: "🔧", onSuccess: "chaos", onFail: "chaos" },
      ],
      Momo: [
        { label: "Plea for de-escalation", emoji: "🙏", onSuccess: "corner", onFail: "chaos" },
        { label: "Ghost the conversation", emoji: "👻", onSuccess: "chaos", onFail: "chaos" },
      ],
    },
    /** Role-specific choices for bridge nodes */
    roleChoices_bridge_cleared: {
      You: [
        { label: "Send it, end it clean", emoji: "🧾", onSuccess: "cleared", onFail: "truce" },
        { label: "Hold, give them a chance", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
      ],
      Mia: [
        { label: "Post with receipts", emoji: "📁", onSuccess: "cleared", onFail: "truce" },
        { label: "Offer a quiet truce", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
      ],
      Kai: [
        { label: "Full exposure, no half measures", emoji: "📂", onSuccess: "cleared", onFail: "truce" },
        { label: "Leave it ambiguous", emoji: "❓", onSuccess: "truce", onFail: "fizzle" },
      ],
      Momo: [
        { label: "Push for resolution", emoji: "🔨", onSuccess: "cleared", onFail: "truce" },
        { label: "Let it fade naturally", emoji: "🍂", onSuccess: "truce", onFail: "fizzle" },
      ],
    },
    roleChoices_bridge_truce: {
      You: [
        { label: "Send the truce", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
        { label: "Back away, stay unresolved", emoji: "🫥", onSuccess: "fizzle", onFail: "fizzle" },
      ],
      Mia: [
        { label: "Accept the truce warmly", emoji: "😊", onSuccess: "truce", onFail: "fizzle" },
        { label: "Counter-offer instead", emoji: "🔄", onSuccess: "fizzle", onFail: "fizzle" },
      ],
      Kai: [
        { label: "Agree to move forward", emoji: "✅", onSuccess: "truce", onFail: "fizzle" },
        { label: "Demand an apology first", emoji: "⚠️", onSuccess: "fizzle", onFail: "fizzle" },
      ],
      Momo: [
        { label: "Support the peace deal", emoji: "🕊️", onSuccess: "truce", onFail: "fizzle" },
        { label: "Stay neutral, observe", emoji: "⚖️", onSuccess: "fizzle", onFail: "fizzle" },
      ],
    },
    roleChoices_bridge_fizzle: {
      You: [
        { label: "Try one last save", emoji: "😅", onSuccess: "truce", onFail: "fizzle" },
        { label: "Let it fade out", emoji: "🫥", onSuccess: "fizzle", onFail: "fizzle" },
      ],
      Mia: [
        { label: "Make one final plea", emoji: "🥺", onSuccess: "truce", onFail: "fizzle" },
        { label: "Disappear silently", emoji: "👻", onSuccess: "fizzle", onFail: "fizzle" },
      ],
      Kai: [
        { label: "Archive everything for later", emoji: "💾", onSuccess: "truce", onFail: "fizzle" },
        { label: "Delete the chat history", emoji: "🗑️", onSuccess: "fizzle", onFail: "fizzle" },
      ],
      Momo: [
        { label: "One last mediation attempt", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
        { label: "Walk away for good", emoji: "🚪", onSuccess: "fizzle", onFail: "fizzle" },
      ],
    },
    /** Role-specific choices for the "corner" node */
    roleChoices_corner: {
      You: [
        { label: "Post the final receipt", emoji: "🧾", onSuccess: "bridge_cleared", onFail: "bridge_fizzle" },
        { label: "Offer them a truce", emoji: "🤝", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
      ],
      Mia: [
        { label: "Post a sad story", emoji: "😢", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        { label: "Go live for justice", emoji: "📱", onSuccess: "bridge_cleared", onFail: "bridge_fizzle" },
      ],
      Kai: [
        { label: "Drop the full receipt folder", emoji: "📁", onSuccess: "bridge_cleared", onFail: "bridge_fizzle" },
        { label: "Ask for proof first", emoji: "🔍", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
      ],
      Momo: [
        { label: "Propose a group truce", emoji: "🕊️", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        { label: "Stay silent, let it pass", emoji: "🤐", onSuccess: "bridge_fizzle", onFail: "bridge_fizzle" },
      ],
    },
    /** Role-specific choices for the "chaos" node */
    roleChoices_chaos: {
      You: [
        { label: "Salvage it with one joke", emoji: "😂", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        { label: "Burn the whole thing down", emoji: "🔥", onSuccess: "bridge_fizzle", onFail: "bridge_fizzle" },
      ],
      Mia: [
        { label: "Defuse with a selfie", emoji: "🤳", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        { label: "Fan the flames for content", emoji: "🔥", onSuccess: "bridge_fizzle", onFail: "bridge_fizzle" },
      ],
      Kai: [
        { label: "Clear the chat, restart", emoji: "♻️", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        { label: "Pin the blame elsewhere", emoji: "📍", onSuccess: "bridge_fizzle", onFail: "bridge_fizzle" },
      ],
      Momo: [
        { label: "Everyone calm down pls", emoji: "😓", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
        { label: "Leave the chat dramatically", emoji: "🚪", onSuccess: "bridge_fizzle", onFail: "bridge_fizzle" },
      ],
    },
    /** Role-specific choices for the "open" node */
    roleChoices_open: {
      You: [
        { label: "Stay calm, ask for proof", emoji: "🧊", onSuccess: "calm", onFail: "messy" },
        { label: "Clap back immediately", emoji: "🔥", onSuccess: "bold", onFail: "messy" },
      ],
      Mia: [
        { label: "Cry on cue for sympathy", emoji: "😢", onSuccess: "calm", onFail: "messy" },
        { label: "Go live from the chat", emoji: "📱", onSuccess: "bold", onFail: "messy" },
      ],
      Kai: [
        { label: "Post the old screenshots", emoji: "📸", onSuccess: "calm", onFail: "messy" },
        { label: "Tag everyone for receipts", emoji: "🏷️", onSuccess: "bold", onFail: "messy" },
      ],
      Momo: [
        { label: "Type 'guys can we not'", emoji: "🤐", onSuccess: "calm", onFail: "messy" },
        { label: "Try to mediate", emoji: "🤝", onSuccess: "bold", onFail: "messy" },
      ],
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
    common: ["📸 Pull up a screenshot", "🗳️ Ask the chat to weigh in", "🤐 Say nothing, let it cook"],
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
          { label: "Post the proof", emoji: "🧾", onSuccess: "bridge_uncancelled", onFail: "bridge_smaller" },
          { label: "Soft-launch the comeback", emoji: "🚀", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        ],
      },
      chaos: {
        id: "chaos",
        scene:
          "The lore is expanding faster than the follower count is shrinking. There's one pivot left before the brand walks for good.",
        choices: [
          { label: "Pivot niche + thank the haters", emoji: "🌱", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
          { label: "Do a full tell-all", emoji: "🎙️", onSuccess: "bridge_smaller", onFail: "bridge_smaller" },
        ],
      },
      bridge_uncancelled: {
        id: "bridge_uncancelled",
        scene:
          "The proof is loaded — one tweet and the narrative flips. But as you stare at the post button, you realise what comes after. The follow-up. The expectations. Can you actually deliver?",
        choices: [
          { label: "Post it, own the moment", emoji: "🧾", onSuccess: "uncancelled", onFail: "comeback" },
          { label: "Hold back, rebuild slowly", emoji: "🌱", onSuccess: "comeback", onFail: "smaller" },
        ],
      },
      bridge_comeback: {
        id: "bridge_comeback",
        scene:
          "The comeback stream is queued, the thumbnail's perfect. But something in you hesitates. Is this the real you, or just what they want to see?",
        choices: [
          { label: "Go live, be the moment", emoji: "🎬", onSuccess: "comeback", onFail: "smaller" },
          { label: "Cancel, stay real", emoji: "🔒", onSuccess: "smaller", onFail: "smaller" },
        ],
      },
      bridge_smaller: {
        id: "bridge_smaller",
        scene:
          "The follower count keeps dropping. You could chase the numbers again — pivot, collab, perform. Or you could accept smaller and make it mean something.",
        choices: [
          { label: "Fight for the comeback", emoji: "⚔️", onSuccess: "comeback", onFail: "smaller" },
          { label: "Embrace the decline", emoji: "📉", onSuccess: "smaller", onFail: "smaller" },
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
    common: ["📊 Check the live numbers", "🎬 Post a softer clip", "🙊 Mute the comments"],
    /** Role-specific choices for Story 2 */
    roleChoices_open: {
      You: [
        { label: "Push her live to own it", emoji: "🎤", onSuccess: "live", onFail: "messy" },
        { label: "Post a Notes-app apology", emoji: "📝", onSuccess: "apology", onFail: "messy" },
      ],
      Mia: [
        { label: "Go live and cry on cue", emoji: "😢", onSuccess: "live", onFail: "messy" },
        { label: "Pre-record a sincere apology", emoji: "🎬", onSuccess: "apology", onFail: "messy" },
      ],
      Kai: [
        { label: "Cut to raw footage immediately", emoji: "🎬", onSuccess: "live", onFail: "messy" },
        { label: "Release a prepared statement", emoji: "📄", onSuccess: "apology", onFail: "messy" },
      ],
      Momo: [
        { label: "Spin the narrative positively", emoji: "🔄", onSuccess: "apology", onFail: "messy" },
        { label: "Issue a formal brand statement", emoji: "📋", onSuccess: "apology", onFail: "messy" },
      ],
    },
    roleChoices_corner: {
      You: [
        { label: "Post the proof", emoji: "🧾", onSuccess: "bridge_uncancelled", onFail: "bridge_smaller" },
        { label: "Soft-launch the comeback", emoji: "🚀", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
      ],
      Mia: [
        { label: "Rebrand as 'vulnerable moment'", emoji: "💖", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        { label: "Go mega-viral with the drama", emoji: "🔥", onSuccess: "bridge_uncancelled", onFail: "bridge_smaller" },
      ],
      Kai: [
        { label: "Release the raw receipts", emoji: "📂", onSuccess: "bridge_uncancelled", onFail: "bridge_smaller" },
        { label: "Edit to downplay the leak", emoji: "✂️", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
      ],
      Momo: [
        { label: "Negotiate with brand quietly", emoji: "🤝", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        { label: "Send damage control email", emoji: "📧", onSuccess: "bridge_smaller", onFail: "bridge_smaller" },
      ],
    },
    roleChoices_chaos: {
      You: [
        { label: "Pivot niche + thank the haters", emoji: "🌱", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        { label: "Do a full tell-all", emoji: "🎙️", onSuccess: "bridge_smaller", onFail: "bridge_smaller" },
      ],
      Mia: [
        { label: "Pivot to authenticity", emoji: "💯", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        { label: "Lean into the chaos for content", emoji: "🔥", onSuccess: "bridge_smaller", onFail: "bridge_smaller" },
      ],
      Kai: [
        { label: "Release an edited timeline", emoji: "✂️", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        { label: "Publish the full uncut story", emoji: "📰", onSuccess: "bridge_smaller", onFail: "bridge_smaller" },
      ],
      Momo: [
        { label: "Quietly reach out to brands", emoji: "📧", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
        { label: "Distance from the brand", emoji: "🚫", onSuccess: "bridge_smaller", onFail: "bridge_smaller" },
      ],
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
          { label: "Try the final lock", emoji: "🗝️", onSuccess: "bridge_out", onFail: "bridge_haunted" },
          { label: "Trace the wiring first", emoji: "🔌", onSuccess: "bridge_out", onFail: "bridge_haunted" },
        ],
      },
      loop: {
        id: "loop",
        scene:
          "The door swings open onto the very first room again, the candle still lit exactly as you left it. You've been here before. Keep your nerve.",
        choices: [
          { label: "Keep nerve, find the hatch", emoji: "🧊", onSuccess: "bridge_out", onFail: "bridge_stuck" },
          { label: "Smash straight through the wall", emoji: "🧱", onSuccess: "bridge_haunted", onFail: "bridge_stuck" },
        ],
      },
      bridge_out: {
        id: "bridge_out",
        scene:
          "The final door clicks under your hand. You can see the streetlights through the glass. But something makes you pause — what if this is another loop?",
        choices: [
          { label: "Push through, trust it's real", emoji: "🚪", onSuccess: "out", onFail: "haunted" },
          { label: "Wait, listen for the room", emoji: "👂", onSuccess: "haunted", onFail: "stuck" },
        ],
      },
      bridge_haunted: {
        id: "bridge_haunted",
        scene:
          "You're inches from freedom, but your hands won't stop shaking. The room's reset itself three times. How do you know this door leads anywhere?",
        choices: [
          { label: "Trust your gut, walk out", emoji: "🚶", onSuccess: "haunted", onFail: "stuck" },
          { label: "Stay inside, refuse to leave", emoji: "🏠", onSuccess: "stuck", onFail: "stuck" },
        ],
      },
      bridge_stuck: {
        id: "bridge_stuck",
        scene:
          "The timer's hit triple digits and the walls are definitely closer. You've been here so long you've started forgetting what outside looks like. Maybe that's the point.",
        choices: [
          { label: "One final escape attempt", emoji: "💪", onSuccess: "out", onFail: "stuck" },
          { label: "Accept it, sit down", emoji: "🪑", onSuccess: "stuck", onFail: "stuck" },
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
    common: ["🔦 Sweep the room", "📱 Check for a phone signal", "🧍 Regroup with the others"],
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
          { label: "Make it official", emoji: "💍", onSuccess: "bridge_official", onFail: "bridge_complicated" },
          { label: "Soft-launch it", emoji: "📸", onSuccess: "bridge_official", onFail: "bridge_complicated" },
        ],
      },
      triangle: {
        id: "triangle",
        scene:
          "Screenshots are flying between three group chats and your love life is officially a spectator sport. One move left to land this.",
        choices: [
          { label: "Pick peace, stay real friends", emoji: "🕊️", onSuccess: "bridge_friends", onFail: "bridge_complicated" },
          { label: "Let the gc hold a vote", emoji: "🗳️", onSuccess: "bridge_complicated", onFail: "bridge_complicated" },
        ],
      },
      bridge_official: {
        id: "bridge_official",
        scene:
          "The 'official' post is drafted, caption and everything. But as you stare at the button, you realise — once you post this, there's no going back. The chat, the friendship, the situationship — everything changes.",
        choices: [
          { label: "Post it, go all in", emoji: "💍", onSuccess: "official", onFail: "complicated" },
          { label: "Delete, keep it vague", emoji: "🫥", onSuccess: "complicated", onFail: "complicated" },
        ],
      },
      bridge_friends: {
        id: "bridge_friends",
        scene:
          "You could choose peace — stay friends, pretend the feelings never happened. But the situationship keeps typing 'haha' and part of you wonders if you're settling.",
        choices: [
          { label: "Choose friendship, for real", emoji: "🕊️", onSuccess: "friends", onFail: "complicated" },
          { label: "Risk it, admit the feelings", emoji: "💘", onSuccess: "official", onFail: "complicated" },
        ],
      },
      bridge_complicated: {
        id: "bridge_complicated",
        scene:
          "Three group chats, five screenshots, and nobody knows what's real anymore. You could end it now — call it, label it, or delete it. Or you could let it stay beautifully messy.",
        choices: [
          { label: "Define it, end the ambiguity", emoji: "🏷️", onSuccess: "official", onFail: "friends" },
          { label: "Leave it undefined", emoji: "❓", onSuccess: "complicated", onFail: "complicated" },
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
    common: ["📱 Re-read the messages", "👀 See who's typing", "🫥 Send a vague 'haha'"],
    cta: "Start your own situationship saga on Zymix",
  },
];

/** Lookup by theme/key for selectors. */
export const BRANCHING_THEMES = BRANCHING_STORIES.map((s) => s.theme);
