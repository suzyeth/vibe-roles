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

// --- NPC dice bias (ported from vibe-dice demo `rollNPC`) ---
// AI stand-ins roll slightly high (base + 0..2) so their turns keep the story
// moving and fun, while still capping at a natural 20.

/** Pure core: apply an NPC bonus to a base roll, clamped to 1..20. */
export function npcBiasedValue(base: number, bonus: number): number {
  return clampD20(base + bonus);
}

/** A plain, fair human D20 roll (1..20). */
export function rollPlayerValue(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/** An NPC D20 roll, biased upward by 0..2 (then clamped to 20). */
export function rollNPCValue(): number {
  const base = Math.floor(Math.random() * 20) + 1; // 1..20
  const bonus = Math.floor(Math.random() * 3); // 0..2
  return npcBiasedValue(base, bonus);
}

// --- Dynamic quest ending (ported from vibe-dice demo `shouldEndStory`) ---
// Instead of a hard "everyone acts once then stop" rule, the quest ends
// probabilistically: never before every player has had a turn, always by a hard
// cap of 2x players, and in between weighted by how far in we are and how well
// the party is doing (a winning party earns a satisfying ending sooner).

/** Rolls of 11+ (Success / Strong Success / Critical Success) count as wins. */
const WIN_THRESHOLD = 11;

/** Share of rolls that were a success or better; 0.5 when no rolls yet. */
export function successRate(rolls: number[]): number {
  if (rolls.length === 0) return 0.5;
  const wins = rolls.filter((v) => clampD20(v) >= WIN_THRESHOLD).length;
  return wins / rolls.length;
}

/**
 * Probability the quest should end after `completedRounds` turns.
 * 0 before everyone has acted once, 1 at the 2x-players hard cap, and a
 * success-weighted ramp (0.3 → 0.95) in between — mirroring the demo's
 * `endingHint * (0.5 + successRate * 0.5)`.
 */
export function endingProbability(
  completedRounds: number,
  playerCount: number,
  rolls: number[],
): number {
  const minRounds = Math.max(1, playerCount);
  const maxRounds = minRounds * 2;
  if (completedRounds < minRounds) return 0;
  if (completedRounds >= maxRounds) return 1;
  const span = Math.max(1, maxRounds - minRounds);
  const progress = (completedRounds - minRounds) / span; // 0..1
  const hint = 0.3 + 0.65 * progress; // demo-style ramp toward a near-certain end
  return hint * (0.5 + successRate(rolls) * 0.5);
}

/** Decide whether the quest ends now. `rand` is injectable for testing. */
export function shouldEndQuest(
  completedRounds: number,
  playerCount: number,
  rolls: number[],
  rand: () => number = Math.random,
): boolean {
  const p = endingProbability(completedRounds, playerCount, rolls);
  if (p <= 0) return false;
  if (p >= 1) return true;
  return rand() < p;
}
