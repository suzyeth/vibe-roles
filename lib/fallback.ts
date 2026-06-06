import type { Quest, FateCard, RoundResult, QuestCard } from "@/lib/schema";
import { rollLabel } from "@/lib/dice";

const ROLE_POOL = [
  { role: "The Overthinking Wizard", ability: "Detect hidden awkwardness" },
  { role: "The Ghost Rogue", ability: "Return from unread messages" },
  { role: "The Chaos Bard", ability: "Turn silence into a song" },
  { role: "The Snack Healer", ability: "Restore morale with chips" },
];
export function fallbackQuest(members: string[]): Quest {
  const names = members.length ? members : ["你"];
  return {
    scene: { theme: "The Unread Beast", setup: "The chat has fallen into silence. The Unread Beast has stolen the last topic.", tone: "chaotic, playful, safe" },
    players: names.map((n, i) => ({ name: n, role: ROLE_POOL[i % ROLE_POOL.length].role, ability: ROLE_POOL[i % ROLE_POOL.length].ability, status: "active" as const })),
    goal: "Recover the stolen topic and revive the chat.",
  };
}
const NARR: Record<string, string> = {
  "Total Chaos": "灾难性翻车，全场陷入最荒谬的混乱。",
  "Awkward Fail": "失败了，但场面尴尬到好笑。",
  "Messy Progress": "勉强推进，但留下了一个麻烦。",
  "Works Somehow": "莫名其妙成功了，只是埋了个雷。",
  "Main Character Moment": "高光时刻，你强势扭转了局面。",
  "Iconic Roll": "史诗级大成功，全场封神。",
};
export function fallbackRoundResult(roll: number, _fate: FateCard[]): RoundResult {
  return { narration: NARR[rollLabel(roll)] ?? "故事继续推进……", advance: true };
}
const PARTY_LINES: Record<string, string[]> = {
  "Total Chaos": ["完了完了我先撤为敬", "我就知道会这样……", "谁让你乱掷的啊！"],
  "Awkward Fail": ["啊这……", "尴尬到脚趾抠出三室一厅", "假装无事发生.jpg"],
  "Messy Progress": ["勉强算赢？", "先别高兴太早", "我怎么闻到一股埋伏的味"],
  "Works Somehow": ["居然成了？", "别问，问就是实力", "见好就收啊喂"],
  "Main Character Moment": ["这波太顶了！", "主角光环直接拉满", "我宣布你是天命人"],
  "Iconic Roll": ["封神现场！", "教科书级操作", "我要截图发到群里炫"],
};
/** 队友针对骰子结果各冒一句（兜底，纯）；按 (seed, index) 取，保证可重现 */
export function fallbackPartyLines(names: string[], label: string, seed: number): { name: string; text: string }[] {
  const pool = PARTY_LINES[label] ?? ["……", "继续继续", "好戏开场了"];
  return names.map((n, i) => ({ name: n, text: pool[(((seed + i) % pool.length) + pool.length) % pool.length] }));
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
