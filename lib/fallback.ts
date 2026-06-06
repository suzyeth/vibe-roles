import type { Quest, FateCard, RoundResult, QuestCard } from "@/lib/schema";
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
  "Total Chaos": "Catastrophic miss — everything spirals into glorious nonsense.",
  "Awkward Fail": "You fail, but in the funniest possible way.",
  "Messy Progress": "You scrape forward, but leave a mess behind.",
  "Works Somehow": "It somehow works — though you planted a problem for later.",
  "Main Character Moment": "Main character moment — you flip the whole scene.",
  "Iconic Roll": "Iconic roll — the whole group goes legendary.",
};
const REACT_POOL = ["wait that actually worked?", "knew this would happen…", "who told you to do that lol", "i'm crying this is too much", "ok hold up we got this", "i'm leaving this group chat"];
export function fallbackRoundResult(roll: number, _fate: FateCard[], reactors: { name: string; role: string }[] = [], seed = 0): RoundResult {
  const reactions = reactors.map((r, i) => ({ member: r.name, text: REACT_POOL[(seed * 2 + i) % REACT_POOL.length] }));
  return { narration: NARR[rollLabel(roll)] ?? "The story rolls on…", reactions, advance: true };
}
const MOCK_FATE: FateCard[] = [
  { type: "curse", title: "Food Metaphor Mode", effect: "All future dialogue must sound like dinner is a psychological condition.", tone: "chaotic but harmless", trigger: "next_round" },
  { type: "character", title: "The Sunglasses Pigeon", effect: "Offers suspicious advice but demands chips.", tone: "chaotic but harmless", trigger: "roll_under_10" },
];
export function fallbackFateCard(input: string, seed: number): FateCard {
  const base = MOCK_FATE[((seed % MOCK_FATE.length) + MOCK_FATE.length) % MOCK_FATE.length];
  return { ...base, title: (input || base.title).slice(0, 24) };
}
export function fallbackQuestCard(finalRoll: number, bestInterference: string): QuestCard {
  return { title: "Quest Completed", caption: "chaotic but alive", best_interference: bestInterference || "—", final_roll: finalRoll, cta: "Start your own quest on Zymix" };
}
