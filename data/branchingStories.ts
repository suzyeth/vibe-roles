/**
 * branchingStories.ts — story-tree scripts for the branching game model.
 *
 * A branching story is a graph of NODES. The human ("You") is the protagonist:
 * at each node they pick one of two choices, roll a D20, and the success/fail of
 * that roll routes to a DIFFERENT next node — so both *which* choice you pick and
 * *how* you roll genuinely change the path. AI members are flavour (reactions);
 * they don't fork the tree.
 *
 * Design rules (kept tight so it stays writable for all 4 themes):
 *  - ~9 nodes + 3 endings per story; each run is ~4-5 of your decisions.
 *  - Each node: one cohesive scene (2-3 sentences) + exactly 2 choices.
 *  - Real divergence: a node's two choices lead to different success targets,
 *    and (except for a deliberate "give up / burn it down" option) each choice's
 *    onSuccess and onFail differ, so the dice always matter.
 *  - choices[0] is the level-headed/baseline branch: the grey "common" actions in
 *    the UI all resolve along it, so it should read as the safe default.
 *  - A node id that exists in `endings` terminates the story.
 *
 * Single source of truth: the UI shows and the engine routes by `node.choices`.
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

export interface RoleEvent {
  /** DM line announcing the event before the reroute. */
  line: string;
  /** Node or ending id to reroute to. */
  target: string;
  /** One-line lasting consequence, shown on the ending card if this was the
   *  run's pivotal event (boon = triumphant, chaos = rueful). */
  coda: string;
}

export interface RoleEvents {
  boon: RoleEvent;
  chaos: RoleEvent;
}

export interface BranchNode {
  id: string;
  /** The cohesive scene narration shown as ONE block when this node opens. */
  scene: string;
  /** Exactly 2 choices for the protagonist. */
  choices: BranchChoice[];
}

export interface BranchEnding {
  id: string;
  /** Final narration block. */
  scene: string;
  title: string;
  caption: string;
  /** Outcome mood — themes the ending card (win = green, mixed = purple, down = slate). */
  tone: 'win' | 'mixed' | 'down';
}

export interface BranchingStory {
  key: string;
  theme: string;
  emoji: string;
  tone: string;
  /** Story-specific accent colour (hex) — themes the DM avatar/name + tension bar. */
  accent: string;
  setup: string;
  goal: string;
  roles: Record<string, { role: string; ability: string; detail: string }>;
  defaultRole: { role: string; ability: string; detail: string };
  /** One cohesive opening block (replaces the choppy multi-line prologue). */
  intro: string;
  /** Global gossip pool — AI members rotate through these as flavour. */
  reactions: string[];
  /** Story-themed universal actions — the grey "common" option group, shown
   *  alongside each node's branches. They resolve along choices[0]. */
  common: string[];
  /** Where the story begins. */
  start: string;
  nodes: Record<string, BranchNode>;
  endings: Record<string, BranchEnding>;
  /** Story-specific examples of how an invited friend's "twist" changes the plot,
   *  shown in the invite sheet. */
  twists: { icon: string; title: string; detail: string }[];
  cta: string;
  /** Short goal text for the persistent header chip (full text stays in `goal`/`intro`). */
  goalShort: string;
  /** Story-named tension meter shown during play. */
  crisisMeter: { name: string; emoji: string };
  /** Teammate role events keyed by member name; a strong/weak roll fires one. */
  roleEvents: Record<string, RoleEvents>;
  /** Fallback role event for members without a named entry. */
  defaultRoleEvent: RoleEvents;
}

export const BRANCHING_STORIES: BranchingStory[] = [
  // ─── 1. Group Chat on Trial ────────────────────────────────────────────────
  {
    key: "group-chat-trial",
    theme: "Group Chat on Trial",
    emoji: "📱",
    tone: "chaotic but harmless",
    accent: "#7C3AED",
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
      "log OFF babes it's 4am",
      "the gc is FED rn",
      "praying for you bestie 🙏",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "The accusation lands and forty-seven people go quiet at once, waiting to see how you'll react. Every second you don't reply, the silence types your guilt for you.",
        choices: [
          { label: "Stay calm, ask for proof", emoji: "🧊", onSuccess: "calm", onFail: "messy" },
          { label: "Clap back in all caps", emoji: "🔥", onSuccess: "bold", onFail: "chaos" },
        ],
      },
      calm: {
        id: "calm",
        scene:
          "Your composure throws the room — people expected a meltdown and got a shrug. A few lurkers quietly switch to your side, and the real leaker starts to look twitchy.",
        choices: [
          { label: "Quietly DM the suspect", emoji: "🕵️", onSuccess: "corner", onFail: "bridge_truce" },
          { label: "Call a flat-wide vote", emoji: "🗳️", onSuccess: "bridge_cleared", onFail: "chaos" },
        ],
      },
      bold: {
        id: "bold",
        scene:
          "You came in loud and the chat is electric — half horrified, half here for it. It's working, but you're one wrong word from becoming the villain of your own story.",
        choices: [
          { label: "Drop a counter-screenshot", emoji: "📸", onSuccess: "corner", onFail: "messy" },
          { label: "Name the leaker outright", emoji: "🎯", onSuccess: "bridge_cleared", onFail: "chaos" },
        ],
      },
      messy: {
        id: "messy",
        scene:
          "It got away from you — paragraphs, a typo everyone screenshotted, and now two people are allied against you. The chat smells blood and it's pointed your way.",
        choices: [
          { label: "Damage control, fast", emoji: "🩹", onSuccess: "corner", onFail: "bridge_fizzle" },
          { label: "Rage-type a full paragraph", emoji: "🧱", onSuccess: "chaos", onFail: "bridge_fizzle" },
        ],
      },
      chaos: {
        id: "chaos",
        scene:
          "It's fully feral now — three side-chats, a screenshot of a screenshot, and nobody sober enough to stop it. There's one narrow window to turn the mood before the flat splits for good.",
        choices: [
          { label: "Salvage it with one joke", emoji: "😂", onSuccess: "bridge_truce", onFail: "bridge_fizzle" },
          { label: "Expose everyone's gc sins", emoji: "🧨", onSuccess: "bridge_cleared", onFail: "bridge_fizzle" },
        ],
      },
      corner: {
        id: "corner",
        scene:
          "A cropped screenshot gives the leaker away — cropping, as everyone now agrees, IS lying. You've got them cornered; the whole chat is watching what you do with it.",
        choices: [
          { label: "Post the final receipt", emoji: "🧾", onSuccess: "cleared", onFail: "truce" },
          { label: "Offer them a quiet exit", emoji: "🤝", onSuccess: "truce", onFail: "fizzle" },
        ],
      },
      bridge_cleared: {
        id: "bridge_cleared",
        scene:
          "It's gone fully public — the whole year group is in the chat now, screenshots stacked three deep, the leaker's last message still showing 'typing…' then nothing. One move decides how tonight gets remembered.",
        choices: [
          { label: "Name them with the full thread", emoji: "🧾", onSuccess: "cleared", onFail: "fizzle" },
          { label: "Give them ten seconds to confess", emoji: "⏱️", onSuccess: "truce", onFail: "fizzle" },
        ],
      },
      bridge_truce: {
        id: "bridge_truce",
        scene:
          "The suspect slides into your DMs — a paragraph, a real apology, no audience this time. The main chat still wants blood, but this part is just between you two now.",
        choices: [
          { label: "Accept it, post that it's sorted", emoji: "🕊️", onSuccess: "truce", onFail: "fizzle" },
          { label: "Screenshot the apology as proof", emoji: "📸", onSuccess: "cleared", onFail: "fizzle" },
        ],
      },
      bridge_fizzle: {
        id: "bridge_fizzle",
        scene:
          "Three people have already left, two side-chats have spawned, and someone just posted a screenshot of a screenshot of a screenshot. The flat chat is one message from total collapse.",
        choices: [
          { label: "One last line to hold it together", emoji: "😅", onSuccess: "truce", onFail: "fizzle" },
          { label: "Log off, let it burn", emoji: "🔥", onSuccess: "fizzle", onFail: "fizzle" },
        ],
      },
      kai_receipt: {
        id: "kai_receipt",
        scene:
          "Kai pastes the original, uncropped screenshot — timestamps, sender, the lot — straight from a folder literally named 'evidence'. The chat goes dead silent as everyone does the maths. The leaker's story just fell apart in real time.",
        choices: [
          { label: "Let the receipts speak", emoji: "🧾", onSuccess: "corner", onFail: "bridge_cleared" },
          { label: "Add your own caption", emoji: "✍️", onSuccess: "bridge_cleared", onFail: "chaos" },
        ],
      },
      mia_meltdown: {
        id: "mia_meltdown",
        scene:
          "Mia's tear-streaked Story hits 300 views in a minute and the comments pivot hard — sympathy, outrage at the leaker, a meme already forming. The narrative is suddenly yours to lose.",
        choices: [
          { label: "Ride the sympathy wave", emoji: "🌊", onSuccess: "bridge_cleared", onFail: "messy" },
          { label: "Redirect it at the leaker", emoji: "🎯", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      momo_truce: {
        id: "momo_truce",
        scene:
          "Momo's billionth 'guys, can we actually not' lands for once — the all-caps stops, people put their phones down for a second. In the lull, the leaker looks rattled and exposed.",
        choices: [
          { label: "Use the calm to corner them", emoji: "🕊️", onSuccess: "corner", onFail: "bridge_truce" },
          { label: "Call for a clean vote", emoji: "🗳️", onSuccess: "bridge_cleared", onFail: "chaos" },
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
        tone: "win",
      },
      truce: {
        id: "truce",
        scene:
          "Nobody fully wins, but one well-timed line breaks the tension and the flat decides it'd rather stay friends than be right. Messy peace, but peace.",
        title: "Messy Peace",
        caption: "the flat survived, barely",
        tone: "mixed",
      },
      fizzle: {
        id: "fizzle",
        scene:
          "Nobody admits anything, half the group mutes the chat, and yet somehow everyone's still here at 3am sending memes. Unresolved, toxic, weirdly loyal.",
        title: "Left On Read",
        caption: "no verdict, just vibes",
        tone: "down",
      },
    },
    common: ["📸 Pull up a screenshot", "🗳️ Ask the chat to weigh in", "🤐 Say nothing, let it cook"],
    twists: [
      { icon: "📸", title: "Leak a new screenshot", detail: "reroute who the chat thinks is guilty" },
      { icon: "🎭", title: "Add a mutual from another flat", detail: "a surprise witness joins the chat" },
      { icon: "🗳️", title: "Start a public poll", detail: "the whole year group votes on your fate" },
      { icon: "✨", title: "Resurface an old receipt", detail: "fuse a buried Year-9 screenshot into it" },
    ],
    cta: "Start your own group drama on Zymix",
    goalShort: "Clear your name & unmask the leaker",
    crisisMeter: { name: "Group Chat Meltdown", emoji: "🔥" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai drops a screenshot from a folder literally named 'evidence' — the timestamps don't lie.", target: "kai_receipt", coda: "And in the end it was Kai's receipts folder that cleared your name." },
        chaos: { line: "Kai pastes the WRONG screenshot — your pettiest drafts — and the chat inhales.", target: "messy", coda: "And it was Kai fumbling the wrong screenshot that nearly buried you." },
      },
      Mia: {
        boon: { line: "Mia bursts into tears on camera and posts it to her Story — somehow the whole year group is on your side now.", target: "mia_meltdown", coda: "And it was Mia's on-cue breakdown, filmed in 4K, that turned the crowd." },
        chaos: { line: "Mia's 'storytime' goes off-script and names three innocent people; it's chaos now.", target: "chaos", coda: "And it was Mia's off-script storytime that nearly torched it." },
      },
      Momo: {
        boon: { line: "Momo types one 'guys, can we actually not' that — miraculously — everyone listens to.", target: "momo_truce", coda: "And somehow it was Momo's billionth 'can we not' that finally landed." },
        chaos: { line: "Momo tries to mediate and accidentally confirms the worst version of events.", target: "messy", coda: "And it was Momo's peacemaking that accidentally lit the fuse." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "A quiet lurker finally types — and drops exactly the receipt you needed.", target: "kai_receipt", coda: "And it was the quiet one who turned out to have the receipts." },
      chaos: { line: "A lurker screenshots everything to another chat and the mess doubles.", target: "chaos", coda: "And it was a silent lurker who quietly made it all worse." },
    },
  },

  // ─── 2. The Ring Light Goes Dark ───────────────────────────────────────────
  {
    key: "ring-light-goes-dark",
    theme: "The Ring Light Goes Dark",
    emoji: "💡",
    tone: "chaotic but harmless",
    accent: "#EC4899",
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
      "monetisation switched OFF",
      "PR team in absolute shambles",
      "the algorithm is watching 👀",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "The comments are scrolling faster than anyone can read and a brand rep is typing the word 'unfortunately'. You've got about ten seconds to decide how this meltdown gets remembered.",
        choices: [
          { label: "Post a measured Notes-app apology", emoji: "📝", onSuccess: "apology", onFail: "messy" },
          { label: "Push her live to own it raw", emoji: "🎤", onSuccess: "live", onFail: "chaos" },
        ],
      },
      apology: {
        id: "apology",
        scene:
          "The apology lands… mostly. The tea pages are squinting at it, but the diehards have started rallying in the replies and a few brands quietly un-mute their DMs.",
        choices: [
          { label: "Drop a docu-style storytime", emoji: "🎬", onSuccess: "corner", onFail: "bridge_smaller" },
          { label: "Collab with a bigger creator", emoji: "🤝", onSuccess: "bridge_comeback", onFail: "chaos" },
        ],
      },
      live: {
        id: "live",
        scene:
          "She owns the whole thing in thirty unscripted seconds and — plot twist — the comments actually soften. The momentum is briefly, miraculously, yours.",
        choices: [
          { label: "Pull the analytics up live", emoji: "📊", onSuccess: "corner", onFail: "messy" },
          { label: "Announce a charity stream", emoji: "💚", onSuccess: "bridge_comeback", onFail: "chaos" },
        ],
      },
      messy: {
        id: "messy",
        scene:
          "Two fonts. TWO. The screenshot is already a tea-page countdown and the editor — who has every raw file — is giving you a very particular look.",
        choices: [
          { label: "Damage-control livestream", emoji: "🩹", onSuccess: "corner", onFail: "bridge_smaller" },
          { label: "Turn the comments off", emoji: "🙊", onSuccess: "chaos", onFail: "bridge_smaller" },
        ],
      },
      chaos: {
        id: "chaos",
        scene:
          "The lore is expanding faster than the follower count is shrinking. There's one pivot left before the brand walks for good.",
        choices: [
          { label: "Pivot niche, thank the haters", emoji: "🌱", onSuccess: "bridge_comeback", onFail: "bridge_smaller" },
          { label: "Go full unfiltered tell-all", emoji: "🎙️", onSuccess: "bridge_uncancelled", onFail: "bridge_smaller" },
        ],
      },
      corner: {
        id: "corner",
        scene:
          "You trace the original 'leak' to a rival tea page and you've got the receipts. One clean post could flip the entire narrative in your favour.",
        choices: [
          { label: "Post the proof clean", emoji: "🧾", onSuccess: "uncancelled", onFail: "comeback" },
          { label: "Soft-launch the comeback instead", emoji: "🚀", onSuccess: "comeback", onFail: "smaller" },
        ],
      },
      bridge_uncancelled: {
        id: "bridge_uncancelled",
        scene:
          "The proof goes up and the narrative flips in real time — the rival tea page sets itself to private, the pile-on becomes a pile of apologies, and the brand rep starts typing again.",
        choices: [
          { label: "Re-sign the brand deal on camera", emoji: "🧾", onSuccess: "uncancelled", onFail: "comeback" },
          { label: "Spin it into a redemption series", emoji: "🎬", onSuccess: "comeback", onFail: "smaller" },
        ],
      },
      bridge_comeback: {
        id: "bridge_comeback",
        scene:
          "Forty thousand are already waiting in the pre-live lobby and a bigger creator just DM'd to duet. The thumbnail's perfect. This is the moment — if it's the real her on screen.",
        choices: [
          { label: "Go live, raw and real", emoji: "🎬", onSuccess: "comeback", onFail: "smaller" },
          { label: "Reveal the rival's receipts mid-stream", emoji: "🧾", onSuccess: "uncancelled", onFail: "smaller" },
        ],
      },
      bridge_smaller: {
        id: "bridge_smaller",
        scene:
          "Twelve thousand gone and counting. The brand's gone quiet for good — but the comments still left are unhinged in the best way, the ones who actually watch to the end.",
        choices: [
          { label: "Double down on the diehards", emoji: "💚", onSuccess: "comeback", onFail: "smaller" },
          { label: "Make peace with smaller", emoji: "📉", onSuccess: "smaller", onFail: "smaller" },
        ],
      },
      kai_cut: {
        id: "kai_cut",
        scene:
          "Kai drops the unedited raw file side-by-side with the 'leak' — the splice is obvious, the receipts undeniable. The tea pages start quietly deleting.",
        choices: [
          { label: "Post the side-by-side", emoji: "🧾", onSuccess: "bridge_uncancelled", onFail: "corner" },
          { label: "Save it, soft-launch instead", emoji: "🚀", onSuccess: "corner", onFail: "chaos" },
        ],
      },
      mia_live: {
        id: "mia_live",
        scene:
          "Mia's unscripted live peaks — raw, messy, weirdly endearing — and the sentiment flips in real time. Forty thousand are watching her be human.",
        choices: [
          { label: "Pin the apology, ride it", emoji: "📌", onSuccess: "bridge_comeback", onFail: "messy" },
          { label: "Announce a charity stream", emoji: "💚", onSuccess: "bridge_uncancelled", onFail: "chaos" },
        ],
      },
      momo_cheque: {
        id: "momo_cheque",
        scene:
          "Momo posts a calm, corporate 'we stand by our creator' — and suddenly the brand's exit becomes a vote of confidence. The other sponsors un-mute.",
        choices: [
          { label: "Sign it live", emoji: "🧾", onSuccess: "bridge_uncancelled", onFail: "corner" },
          { label: "Leverage it for a bigger deal", emoji: "📈", onSuccess: "bridge_comeback", onFail: "chaos" },
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
        tone: "win",
      },
      comeback: {
        id: "comeback",
        scene:
          "The comeback stream peaks at 40k live and a bigger creator duets her supportively. She's trending — the good kind, for once.",
        title: "Comeback Arc",
        caption: "trending on purpose this time",
        tone: "win",
      },
      smaller: {
        id: "smaller",
        scene:
          "Followers dip by twelve thousand, but the ones who stayed are unhinged in the best way. Smaller, feral, loyal.",
        title: "Smaller But Feral",
        caption: "lost the numbers, kept the diehards",
        tone: "mixed",
      },
    },
    common: ["📊 Check the live numbers", "🎬 Post a softer clip", "🙊 Mute the comments"],
    twists: [
      { icon: "🎙️", title: "Drop a rival's diss video", detail: "reroute the comeback into a feud" },
      { icon: "🎭", title: "Bring in a bigger creator", detail: "surprise collab — or a live pile-on" },
      { icon: "🔥", title: "Leak the brand's exit email", detail: "the stakes spike on stream" },
      { icon: "✨", title: "Pivot to a new niche", detail: "fuse a fresh content angle into the arc" },
    ],
    cta: "Start your own creator saga on Zymix",
    goalShort: "Save the channel before brunch cancels it",
    crisisMeter: { name: "Cancel Meter", emoji: "📉" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai digs up the raw timeline and finds the clip that proves the 'leak' was edited.", target: "kai_cut", coda: "And it was Kai, who knows where every cut is buried, who proved the leak was faked." },
        chaos: { line: "Kai accidentally uploads the bloopers reel — the mean outtakes — to the main.", target: "messy", coda: "And it was Kai posting the cursed bloopers that deepened the hole." },
      },
      Mia: {
        boon: { line: "Mia goes live, cries and contours simultaneously, and the comments melt.", target: "mia_live", coda: "And it was Mia crying in HD that brought the followers back." },
        chaos: { line: "Mia subtweets the brand mid-meltdown and the cheque visibly trembles.", target: "chaos", coda: "And it was Mia's subtweet that nearly cancelled it for good." },
      },
      Momo: {
        boon: { line: "Momo, still holding the cheque, publicly re-confirms the deal — on camera.", target: "momo_cheque", coda: "And it was Momo keeping the cheque on the table that saved the channel." },
        chaos: { line: "Momo forwards the brand's exit email to the wrong chat. Oops.", target: "chaos", coda: "And it was Momo leaking the exit email that spiked the panic." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "Even a hater turns — posts an 'okay this was actually fine' that resets the room.", target: "kai_cut", coda: "And it was a reformed hater whose comment turned the tide." },
      chaos: { line: "A hater pins a brutal supercut and it spreads.", target: "chaos", coda: "And it was one hater's supercut that nearly sank it." },
    },
  },

  // ─── 3. Locked In at Honeycomb ─────────────────────────────────────────────
  {
    key: "honeycomb-escape",
    theme: "Locked In at Honeycomb",
    emoji: "🔒",
    tone: "tense but harmless",
    accent: "#F59E0B",
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
      "i'm calling my mum",
      "the walls literally MOVED",
      "five stars, no refund 💀",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "The intercom just plays your own knock back at you, a half-second late. Everyone's looking at you to decide the next move before the timer ticks up again.",
        choices: [
          { label: "Read the clue on the wall", emoji: "📜", onSuccess: "draft", onFail: "trapped" },
          { label: "Force the door with everything", emoji: "🔦", onSuccess: "trapped", onFail: "loop" },
        ],
      },
      draft: {
        id: "draft",
        scene:
          "Behind the bookcase: a thin draft of cold, outside air and a seam the set designers definitely never painted. A way out — maybe.",
        choices: [
          { label: "Follow the cold draft", emoji: "💨", onSuccess: "keys", onFail: "loop" },
          { label: "Smash the two-way mirror", emoji: "🪞", onSuccess: "keys", onFail: "trapped" },
        ],
      },
      trapped: {
        id: "trapped",
        scene:
          "The keypad takes your code, beeps approvingly, then silently changes it. The room is learning your moves and playing them back at you.",
        choices: [
          { label: "Crawl through the vent", emoji: "🌀", onSuccess: "keys", onFail: "loop" },
          { label: "Reset the puzzle on purpose", emoji: "♻️", onSuccess: "draft", onFail: "loop" },
        ],
      },
      keys: {
        id: "keys",
        scene:
          "The vent drops you into the empty staff room — no people, but the master keys are right there on the hook, swinging slightly.",
        choices: [
          { label: "Try the final lock", emoji: "🗝️", onSuccess: "bridge_out", onFail: "bridge_haunted" },
          { label: "Trace the wiring behind the door", emoji: "🔌", onSuccess: "bridge_out", onFail: "bridge_stuck" },
        ],
      },
      loop: {
        id: "loop",
        scene:
          "The door swings open onto the very first room again, the candle still lit exactly as you left it. You've been here before. Keep your nerve.",
        choices: [
          { label: "Keep your nerve, find the hatch", emoji: "🧊", onSuccess: "keys", onFail: "bridge_stuck" },
          { label: "Smash straight through the wall", emoji: "🧱", onSuccess: "bridge_haunted", onFail: "bridge_stuck" },
        ],
      },
      bridge_out: {
        id: "bridge_out",
        scene:
          "The last door gives — and there's actual rain on actual tarmac through the gap, a night bus hissing past. After three resets your body doesn't quite trust it, but the cold air is real.",
        choices: [
          { label: "Walk out into the rain", emoji: "🚪", onSuccess: "out", onFail: "haunted" },
          { label: "Wedge it, count everyone out first", emoji: "🧮", onSuccess: "out", onFail: "stuck" },
        ],
      },
      bridge_haunted: {
        id: "bridge_haunted",
        scene:
          "You spill onto the pavement, soaked and laughing too hard — then the intercom behind you crackles your own knock back, half a second late. The door hasn't finished with someone.",
        choices: [
          { label: "Drag everyone clear, don't look back", emoji: "🏃", onSuccess: "haunted", onFail: "stuck" },
          { label: "Go back for the one who wandered off", emoji: "🔦", onSuccess: "out", onFail: "stuck" },
        ],
      },
      bridge_stuck: {
        id: "bridge_stuck",
        scene:
          "The timer rolls into triple digits and the walls have quietly swapped places — the bookcase is where the door was. You've been here long enough to stop being sure which room is even first.",
        choices: [
          { label: "One clear-headed escape attempt", emoji: "💪", onSuccess: "out", onFail: "stuck" },
          { label: "Sit down, let it reset", emoji: "🪑", onSuccess: "stuck", onFail: "stuck" },
        ],
      },
      kai_lock: {
        id: "kai_lock",
        scene:
          "Kai lines up the symbols nobody else noticed and the bolt thunks back. A door you hadn't seen swings inward onto a cold service corridor.",
        choices: [
          { label: "Follow the corridor out", emoji: "🚪", onSuccess: "bridge_out", onFail: "keys" },
          { label: "Grab the master keys first", emoji: "🗝️", onSuccess: "keys", onFail: "loop" },
        ],
      },
      mia_hears: {
        id: "mia_hears",
        scene:
          "Everyone shuts up. Under the fake countdown there's traffic — a bus, real rain, the outside world right behind a painted-over panel.",
        choices: [
          { label: "Break through the panel", emoji: "🧱", onSuccess: "bridge_out", onFail: "loop" },
          { label: "Find the seam and pry it", emoji: "💨", onSuccess: "keys", onFail: "trapped" },
        ],
      },
      momo_torch: {
        id: "momo_torch",
        scene:
          "The dying torch beam glints off a recessed hatch in the floor, half under the rug. It wasn't there last loop. It's there now.",
        choices: [
          { label: "Drop through the hatch", emoji: "🌀", onSuccess: "bridge_out", onFail: "loop" },
          { label: "Check it for a trick first", emoji: "🔦", onSuccess: "keys", onFail: "trapped" },
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
        tone: "win",
      },
      haunted: {
        id: "haunted",
        scene:
          "You're out, soaked and laughing too loudly — but someone keeps glancing back at the door like it might start counting again.",
        title: "Out, Mostly",
        caption: "nobody's looking at the door",
        tone: "mixed",
      },
      stuck: {
        id: "stuck",
        scene:
          "The countdown resets one last time and the lights rearrange the room around you. Honeycomb isn't quite done with you yet.",
        title: "Still Inside",
        caption: "the room kept the receipts",
        tone: "down",
      },
    },
    common: ["🔦 Sweep the room", "📱 Check for a phone signal", "🧍 Regroup with the others"],
    twists: [
      { icon: "🧱", title: "Move a wall", detail: "reroute where the only exit is" },
      { icon: "🎭", title: "Send in a 'staff member'", detail: "a new face — rescue, or part of the trap?" },
      { icon: "⏱️", title: "Restart the countdown", detail: "the room resets harder, stakes climb" },
      { icon: "🗝️", title: "Unlock a hidden room", detail: "fuse a whole new path into the maze" },
    ],
    cta: "Start your own escape on Zymix",
    goalShort: "Find the real exit before the room resets",
    crisisMeter: { name: "Room Reset", emoji: "⏱️" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai goes quiet, then clicks the impossible lock open on the first real try.", target: "kai_lock", coda: "And it was Kai cracking the master lock that got everyone out." },
        chaos: { line: "Kai over-thinks the lock, re-enters the code, and the room resets around you.", target: "loop", coda: "And it was Kai outsmarting himself that triggered another reset." },
      },
      Mia: {
        boon: { line: "Mia freezes — 'shut UP, listen' — and points at the one wall with traffic behind it.", target: "mia_hears", coda: "And it was Mia hearing the night bus through the wall that found the way out." },
        chaos: { line: "Mia screams and knocks the candle — the only clue — into the dark.", target: "trapped", coda: "And it was Mia's scream that cost you the one clue." },
      },
      Momo: {
        boon: { line: "Momo spends the final 4% of battery on one sweep — and the torch catches a hatch.", target: "momo_torch", coda: "And it was Momo's last 4% of phone battery that lit the way out." },
        chaos: { line: "Momo's phone dies mid-step and you lose the way back in the black.", target: "loop", coda: "And it was Momo's battery dying at 0% that lost you the path." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "The one who wandered off reappears — already one room ahead, holding the way out.", target: "kai_lock", coda: "And it was the wanderer, always one room ahead, who'd already found the exit." },
      chaos: { line: "Someone wanders off again and the door re-locks behind them.", target: "loop", coda: "And it was the wanderer vanishing again that reset the whole thing." },
    },
  },

  // ─── 4. Two Texts, One Group Chat ──────────────────────────────────────────
  {
    key: "two-texts-one-chat",
    theme: "Two Texts, One Group Chat",
    emoji: "💔",
    tone: "chaotic but harmless",
    accent: "#F43F5E",
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
      "they VIEWED it. they viewed it.",
      "the gc is in SHAMBLES",
      "no thoughts just three dots",
    ],
    start: "open",
    nodes: {
      open: {
        id: "open",
        scene:
          "Three dots from the ex. Three dots from the situationship. Three dots from your best friend. Everyone's waiting to see whether you commit or crumble.",
        choices: [
          { label: "Claim it was a typo", emoji: "🙈", onSuccess: "typo", onFail: "spiral" },
          { label: "Double down romantically", emoji: "💘", onSuccess: "bold", onFail: "triangle" },
        ],
      },
      bold: {
        id: "bold",
        scene:
          "You double down with one devastating line and the situationship — who only ever sends 'haha' — replies with a full sentence. Real, terrifying movement.",
        choices: [
          { label: "Ask the best friend for intel", emoji: "🕵️", onSuccess: "close", onFail: "triangle" },
          { label: "Plan a 'casual' hangout", emoji: "☕", onSuccess: "close", onFail: "spiral" },
        ],
      },
      typo: {
        id: "typo",
        scene:
          "Nobody believes 'typo, ignore that lol', and the ex reacts with the laughing emoji — which somehow feels deeply personal.",
        choices: [
          { label: "Make it a group joke", emoji: "😂", onSuccess: "close", onFail: "triangle" },
          { label: "Go mysteriously quiet", emoji: "🌫️", onSuccess: "spiral", onFail: "triangle" },
        ],
      },
      spiral: {
        id: "spiral",
        scene:
          "The ex slides into your DMs 'just to check you're okay'. Now there are two situationships and one extremely tense group chat.",
        choices: [
          { label: "Define the relationship now", emoji: "🗣️", onSuccess: "close", onFail: "triangle" },
          { label: "Big romantic gesture", emoji: "🎁", onSuccess: "bridge_official", onFail: "triangle" },
        ],
      },
      close: {
        id: "close",
        scene:
          "Off the record, the feeling's mutual — a hand brush, a held glance, a silence that says everything. It's giving.",
        choices: [
          { label: "Soft-launch it", emoji: "📸", onSuccess: "bridge_official", onFail: "bridge_complicated" },
          { label: "Make it official outright", emoji: "💍", onSuccess: "bridge_official", onFail: "triangle" },
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
          "The soft-launch goes up — a blurry hand, a caption that says nothing and everything. The ex views it first. Then the situationship comments a single 🫶 and the group chat detonates.",
        choices: [
          { label: "Hard-launch it, names and all", emoji: "💍", onSuccess: "official", onFail: "complicated" },
          { label: "Keep it soft, let them guess", emoji: "🫥", onSuccess: "official", onFail: "friends" },
        ],
      },
      bridge_friends: {
        id: "bridge_friends",
        scene:
          "Best friend pulls you aside: 'You don't have to perform this for the chat.' The situationship's still typing 'haha'. For once the room's quiet enough to actually choose.",
        choices: [
          { label: "Choose the friendship, mean it", emoji: "🕊️", onSuccess: "friends", onFail: "complicated" },
          { label: "Say the feelings out loud anyway", emoji: "💘", onSuccess: "official", onFail: "complicated" },
        ],
      },
      bridge_complicated: {
        id: "bridge_complicated",
        scene:
          "Three chats, five screenshots, and a poll someone made called 'are they / aren't they'. You could end the ambiguity with one word — or let it stay exactly this unhinged.",
        choices: [
          { label: "Put a label on it", emoji: "🏷️", onSuccess: "official", onFail: "friends" },
          { label: "Leave it gloriously undefined", emoji: "❓", onSuccess: "complicated", onFail: "complicated" },
        ],
      },
      kai_replies: {
        id: "kai_replies",
        scene:
          "Three dots from Kai, for a long time. Then a paragraph — genuinely, no 'haha' in sight. The whole chat holds its breath.",
        choices: [
          { label: "Answer it honestly", emoji: "💗", onSuccess: "bridge_official", onFail: "triangle" },
          { label: "Take it to DMs", emoji: "📩", onSuccess: "close", onFail: "spiral" },
        ],
      },
      mia_blessing: {
        id: "mia_blessing",
        scene:
          "Mia's 'honestly? good for them x' lands with zero shade, and the chat exhales. The triangle just lost a corner — cleanly, kindly.",
        choices: [
          { label: "Thank her, move forward", emoji: "🕊️", onSuccess: "bridge_official", onFail: "close" },
          { label: "Make the move now", emoji: "💘", onSuccess: "close", onFail: "triangle" },
        ],
      },
      momo_wingman: {
        id: "momo_wingman",
        scene:
          "Momo slides you a one-line script and a 'trust me'. It's perfect — the kind of thing only someone who's known you for years could write.",
        choices: [
          { label: "Send it word for word", emoji: "💌", onSuccess: "bridge_official", onFail: "close" },
          { label: "Make it your own", emoji: "✍️", onSuccess: "close", onFail: "triangle" },
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
        tone: "win",
      },
      friends: {
        id: "friends",
        scene:
          "You pick peace over being right, and somehow that's the most romantic thing you've done all night. No label, but the friendship's bulletproof.",
        title: "Chose Peace",
        caption: "no label, all heart",
        tone: "mixed",
      },
      complicated: {
        id: "complicated",
        scene:
          "It's unlabelled, unresolved, and everyone's still in the chat at 2am typing 'haha'. Could honestly be worse.",
        title: "Read 23:59",
        caption: "complicated, but online",
        tone: "down",
      },
    },
    common: ["📱 Re-read the messages", "👀 See who's typing", "🫥 Send a vague 'haha'"],
    twists: [
      { icon: "📸", title: "Send a fake screenshot", detail: "reroute who knows what about who" },
      { icon: "🎭", title: "Add the ex's new crush", detail: "the triangle grows another corner" },
      { icon: "🔥", title: "Leak the DMs to the gc", detail: "the stakes go fully nuclear" },
      { icon: "✨", title: "Resurface an old voice note", detail: "fuse a new feelings thread into it" },
    ],
    cta: "Start your own situationship saga on Zymix",
    goalShort: "Survive the triangle, keep the friendship",
    crisisMeter: { name: "Drama Meter", emoji: "💔" },
    roleEvents: {
      Kai: {
        boon: { line: "Kai — who only ever sends 'haha' — types a full, terrifying, real sentence.", target: "kai_replies", coda: "And it was Kai breaking the 'haha' streak with actual words that made it real." },
        chaos: { line: "Kai replies 'haha' to your feelings. Just 'haha'. The spiral begins.", target: "spiral", coda: "And it was Kai's single 'haha' that sent it all spiralling." },
      },
      Mia: {
        boon: { line: "Mia, the ex, posts 'honestly? good for them x' — and means it.", target: "mia_blessing", coda: "And it was the ex's blessing that cleared the runway." },
        chaos: { line: "Mia, the ex, screenshots it to her own chat and the triangle grows a corner.", target: "triangle", coda: "And it was the ex's screenshot that widened the triangle." },
      },
      Momo: {
        boon: { line: "Momo, who knew before you did, quietly tells you exactly what to say.", target: "momo_wingman", coda: "And it was Momo, who knew all along, who wingmanned it home." },
        chaos: { line: "Momo accidentally tells the wrong person, and now everyone knows.", target: "spiral", coda: "And it was Momo's slip that made it everyone's business." },
      },
    },
    defaultRoleEvent: {
      boon: { line: "The witness, popcorn down for once, says the one true thing that helps.", target: "kai_replies", coda: "And it was the quiet witness who finally said the useful thing." },
      chaos: { line: "The witness narrates the whole thing to another chat, live.", target: "triangle", coda: "And it was the witness live-tweeting it that blew it up." },
    },
  },
];

/** Lookup by theme/key for selectors. */
export const BRANCHING_THEMES = BRANCHING_STORIES.map((s) => s.theme);
