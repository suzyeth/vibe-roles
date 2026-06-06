import type { Quest, FateCard, RoundResult, QuestCard, ActionOptions } from "@/lib/schema";
import { rollLabel } from "@/lib/dice";

const ROLE_POOL = [
  { role: "The Overthinking Wizard", ability: "Detect hidden awkwardness" },
  { role: "The Ghost Rogue", ability: "Return from unread messages" },
  { role: "The Chaos Bard", ability: "Turn silence into a song" },
  { role: "The Snack Healer", ability: "Restore morale with chips" },
];
export function fallbackQuest(members: string[]): Quest {
  const names = members.length ? members : ["You"];
  return {
    scene: { theme: "The Unread Beast", setup: "The chat has fallen into silence. The Unread Beast has stolen the last topic.", tone: "chaotic, playful, safe" },
    players: names.map((n, i) => ({ name: n, role: ROLE_POOL[i % ROLE_POOL.length].role, ability: ROLE_POOL[i % ROLE_POOL.length].ability, status: "active" as const })),
    goal: "Recover the stolen topic and revive the chat.",
  };
}
const NARR: Record<string, string> = {
  "Critical Fail": "Catastrophic miss — everything spirals into glorious nonsense.",
  "Fail": "You fail, but in the funniest possible way; the situation gets messier.",
  "Partial Progress": "You scrape forward, but it leaves a problem behind.",
  "Success": "It works — you find a new clue or change the scene.",
  "Strong Success": "Strong success — you gain an edge and it shifts the others' situation.",
  "Critical Success": "Critical success — a highlight moment, the whole group benefits.",
};
const REACT_POOL = ["wait that actually worked?", "knew this would happen…", "who told you to do that lol", "i'm crying this is too much", "ok hold up we got this", "i'm leaving this group chat"];
export function fallbackRoundResult(roll: number, _fate: FateCard[], reactors: { name: string; role: string }[] = [], seed = 0): RoundResult {
  const reactions = reactors.map((r, i) => ({ member: r.name, text: REACT_POOL[(seed * 2 + i) % REACT_POOL.length] }));
  return { narration: NARR[rollLabel(roll)] ?? "The story rolls on…", reactions, advance: true };
}
const MOCK_FATE: FateCard[] = [
  { type: "rule", title: "Food Metaphor Mode", effect: "All future dialogue must sound like dinner is a psychological condition.", tone: "chaotic but harmless", trigger: "next_round" },
  { type: "character", title: "The Sunglasses Pigeon", effect: "Offers suspicious advice but demands chips.", tone: "chaotic but harmless", trigger: "roll_under_10" },
];
/** Deterministic offline prologue derived from the quest (English). */
export function fallbackPrologue(quest: Quest): string[] {
  const names = quest.players.map((p) => p.name).join(", ");
  return [
    `${quest.scene.theme}. ${quest.scene.setup}`,
    `Heroes: ${names}. Goal: ${quest.goal}`,
    `Roll the die to begin.`,
  ];
}
export function fallbackFateCard(input: string, seed: number): FateCard {
  const base = MOCK_FATE[((seed % MOCK_FATE.length) + MOCK_FATE.length) % MOCK_FATE.length];
  return { ...base, title: (input || base.title).slice(0, 24) };
}
export function fallbackQuestCard(finalRoll: number, bestInterference: string): QuestCard {
  return { title: "Quest Completed", caption: "chaotic but alive", best_interference: bestInterference || "—", final_roll: finalRoll, cta: "Start your own quest on Zymix" };
}
/** Deterministic offline action options (English). */
export function fallbackActions(active: { name: string; role: string }, seed = 0): ActionOptions {
  const BASE: Record<string, string[]> = {
    "The Overthinking Wizard": ["Analyze the symbols on the wall", "Cast a light spell to reveal hidden paths", "Question whether this is even real"],
    "The Ghost Rogue": ["Sneak past the sleeping guards", "Pick the ancient lock in the shadows", "Vanish and scout ahead"],
    "The Chaos Bard": ["Sing a confusing song to distract them", "Cast a wild spell and see what happens", "Narrate dramatically as you charge in"],
    "The Snack Healer": ["Share chips to boost morale", "Offer a snack to the creature", "Snack your way to victory"],
  };
  const fallback = BASE[active.role] ?? ["Search the area carefully", "Try the obvious solution", "Take a wild guess"];
  const options = fallback.map((s) => s.slice(0, 24));
  const rotate = (arr: string[], k: number): string[] => arr.slice(k).concat(arr.slice(0, k));
  return { options: rotate(options, seed % options.length).slice(0, 3) };
}
