import type { Quest, FateCard, RoundResult, QuestCard, ActionOptions } from "@/lib/schema";
import { rollLabel } from "@/lib/dice";

type FallbackVariant = { setup: string; goal: string; roles: { role: string; ability: string }[] };
const VARIANTS: Record<string, FallbackVariant> = {
  "The 404 Customer": { setup: "A late-night convenience store disconnects from the outside world; the register reads: Welcome, customer #404.", goal: "Escape the looping store and reconnect with the outside.", roles: [{ role: "Store Manager", ability: "Knows the store layout" }, { role: "Delivery Driver", ability: "Knows the route outside" }, { role: "Lost Student", ability: "Notices the smallest details" }, { role: "Investigator", ability: "Reads people and clues" }, { role: "CCTV Operator", ability: "Sees what others miss on the cameras" }] },
  "Space Station SOS": { setup: "The station's oxygen is draining fast and a silent alarm blinks — someone sabotaged life support.", goal: "Restore life support before the timer hits zero.", roles: [{ role: "Commander", ability: "Keeps the crew together" }, { role: "Engineer", ability: "Can patch any system" }, { role: "Rookie Astronaut", ability: "Spots what everyone missed" }, { role: "Suspicious Robot", ability: "Knows things it shouldn't" }, { role: "Stowaway", ability: "Hides in plain sight" }] },
  "Last Train Home": { setup: "The last tube leaves in five minutes and one of you is about to be left behind in the dark.", goal: "Get everyone onto the last train home.", roles: [{ role: "Night Conductor", ability: "Knows every shortcut" }, { role: "Lost Tourist", ability: "Trusts the wrong map" }, { role: "Night Owl", ability: "Wide awake at 2am" }, { role: "Busker", ability: "Distracts anyone with a tune" }, { role: "Pickpocket", ability: "Quick hands, quicker exits" }] },
  "Dorm Kitchen Mystery": { setup: "A mysterious takeaway arrives in the dorm kitchen, addressed to someone who doesn't exist.", goal: "Uncover who placed the order and why.", roles: [{ role: "Flatmate Chef", ability: "Smells a lie a mile off" }, { role: "Hungry Gremlin", ability: "Always near the food" }, { role: "Clean Freak", ability: "Notices anything out of place" }, { role: "Night Snacker", ability: "Roams the kitchen at 3am" }, { role: "Suspicious Landlord", ability: "Has keys to everything" }] },
};
export function fallbackQuest(members: string[], theme?: string): Quest {
  const names = members.length ? members : ["You"];
  const t = theme && VARIANTS[theme] ? theme : "The 404 Customer";
  const v = VARIANTS[t];
  return {
    scene: { theme: t, setup: v.setup, tone: "chaotic, playful, safe" },
    players: names.map((n, i) => ({ name: n, role: v.roles[i % v.roles.length].role, ability: v.roles[i % v.roles.length].ability, status: "active" as const })),
    goal: v.goal,
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
