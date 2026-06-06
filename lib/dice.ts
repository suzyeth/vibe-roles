export type RollLabel =
  | "Critical Fail"
  | "Fail"
  | "Partial Progress"
  | "Success"
  | "Strong Success"
  | "Critical Success";

export function rollLabel(n: number): RollLabel {
  if (n <= 1) return "Critical Fail";
  if (n <= 5) return "Fail";
  if (n <= 10) return "Partial Progress";
  if (n <= 15) return "Success";
  if (n <= 19) return "Strong Success";
  return "Critical Success";
}

export function clampD20(n: number): number {
  return Math.max(1, Math.min(20, Math.floor(n)));
}

// --- DESIGN §4.1 dice system (D20, lightweight labels) ---
export type DiceResult =
  | "critical-fail"
  | "fail"
  | "partial-progress"
  | "success"
  | "strong-success"
  | "critical-success";

export interface DiceRoll {
  value: number; // 1–20
  result: DiceResult;
  label: string;
  emoji: string;
  color: string;
}

export const DICE_MAP: Record<DiceResult, { label: string; emoji: string; color: string; range: [number, number] }> = {
  "critical-fail": { label: "Critical Fail", emoji: "💀", color: "#EF4444", range: [1, 1] },
  "fail": { label: "Fail", emoji: "😬", color: "#F97316", range: [2, 5] },
  "partial-progress": { label: "Partial Progress", emoji: "😅", color: "#EAB308", range: [6, 10] },
  "success": { label: "Success", emoji: "😌", color: "#22C55E", range: [11, 15] },
  "strong-success": { label: "Strong Success", emoji: "😎", color: "#3B82F6", range: [16, 19] },
  "critical-success": { label: "Critical Success", emoji: "🔥", color: "#8B5CF6", range: [20, 20] },
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
