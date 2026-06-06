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
