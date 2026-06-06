export type RollLabel =
  | "Total Chaos"
  | "Awkward Fail"
  | "Messy Progress"
  | "Works Somehow"
  | "Main Character Moment"
  | "Iconic Roll";

export function rollLabel(n: number): RollLabel {
  if (n <= 1) return "Total Chaos";
  if (n <= 5) return "Awkward Fail";
  if (n <= 10) return "Messy Progress";
  if (n <= 15) return "Works Somehow";
  if (n <= 19) return "Main Character Moment";
  return "Iconic Roll";
}

export function clampD20(n: number): number {
  return Math.max(1, Math.min(20, Math.floor(n)));
}

// --- SPEC §2.2 dice system (additive; existing rollLabel/clampD20 stay) ---
export type DiceResult =
  | "total-chaos"
  | "awkward-fail"
  | "messy-progress"
  | "works-somehow"
  | "main-character-moment"
  | "iconic-roll";

export interface DiceRoll {
  value: number; // 1–20
  result: DiceResult;
  label: string;
  emoji: string;
  color: string;
}

export const DICE_MAP: Record<DiceResult, { label: string; emoji: string; color: string; range: [number, number] }> = {
  "total-chaos": { label: "Total Chaos", emoji: "💀", color: "#EF4444", range: [1, 1] },
  "awkward-fail": { label: "Awkward Fail", emoji: "😬", color: "#F97316", range: [2, 5] },
  "messy-progress": { label: "Messy Progress", emoji: "😅", color: "#EAB308", range: [6, 10] },
  "works-somehow": { label: "Works Somehow", emoji: "😌", color: "#22C55E", range: [11, 15] },
  "main-character-moment": { label: "Main Character Moment", emoji: "😎", color: "#3B82F6", range: [16, 19] },
  "iconic-roll": { label: "Iconic Roll", emoji: "🔥", color: "#8B5CF6", range: [20, 20] },
};

export function resultFromValue(value: number): DiceResult {
  const v = clampD20(value);
  return (Object.keys(DICE_MAP) as DiceResult[]).find(
    (k) => v >= DICE_MAP[k].range[0] && v <= DICE_MAP[k].range[1],
  )!;
}

export function toDiceRoll(value: number): DiceRoll {
  const v = clampD20(value);
  const result = resultFromValue(v);
  const m = DICE_MAP[result];
  return { value: v, result, label: m.label, emoji: m.emoji, color: m.color };
}

export function rollDice(): DiceRoll {
  return toDiceRoll(Math.floor(Math.random() * 20) + 1);
}
