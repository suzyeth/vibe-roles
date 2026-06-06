import type { Quest, FateCard, RoundResult, QuestCard, ActionOptions } from "@/lib/schema";
import { rollLabel } from "@/lib/dice";

const ROLE_POOL = [
  { role: "Store Manager", ability: "Knows the store layout" },
  { role: "Delivery Driver", ability: "Knows the route outside" },
  { role: "Lost Student", ability: "Notices the smallest details" },
  { role: "Investigator", ability: "Reads people and clues" },
  { role: "CCTV Operator", ability: "Sees what others miss on the cameras" },
];
export function fallbackQuest(members: string[]): Quest {
  const names = members.length ? members : ["You"];
  return {
    scene: { theme: "The 404 Customer", setup: "A late-night convenience store disconnects from the outside world; the register reads: Welcome, customer #404.", tone: "chaotic, playful, safe" },
    players: names.map((n, i) => ({ name: n, role: ROLE_POOL[i % ROLE_POOL.length].role, ability: ROLE_POOL[i % ROLE_POOL.length].ability, status: "active" as const })),
    goal: "Escape the looping store and reconnect with the outside.",
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
  return { narration: NARR[rollLabel(roll)] ?? "The story rolls on…", reactions, consequence: "The group feels the ripple of that move.", story_state_updates: {}, advance: true };
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
    "Store Manager": ["Check the register log", "Open the staff door", "Grab something to defend with"],
    "Delivery Driver": ["Check the order address", "Look in the van's boot", "Scout the route outside"],
    "Lost Student": ["Find the exit sign", "Check the phone map", "Hide behind the shelves"],
    "Investigator": ["Question the others", "Inspect the receipt", "Follow the strange sound"],
    "CCTV Operator": ["Rewind the footage", "Watch the back room", "Photograph the screen"],
  };
  const fallback = BASE[active.role] ?? ["Search the area carefully", "Try the obvious solution", "Take a wild guess"];
  const options = fallback.map((s) => s.slice(0, 24));
  const rotate = (arr: string[], k: number): string[] => arr.slice(k).concat(arr.slice(0, k));
  return { options: rotate(options, seed % options.length).slice(0, 3) };
}
