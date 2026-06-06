import { describe, it, expect } from "vitest";
import { rollLabel, clampD20, toDiceRoll, DICE_MAP } from "@/lib/dice";

describe("rollLabel", () => {
  it("maps boundaries correctly", () => {
    expect(rollLabel(1)).toBe("Critical Fail");
    expect(rollLabel(5)).toBe("Fail");
    expect(rollLabel(6)).toBe("Partial Progress");
    expect(rollLabel(10)).toBe("Partial Progress");
    expect(rollLabel(11)).toBe("Success");
    expect(rollLabel(15)).toBe("Success");
    expect(rollLabel(16)).toBe("Strong Success");
    expect(rollLabel(19)).toBe("Strong Success");
    expect(rollLabel(20)).toBe("Critical Success");
  });
});

describe("clampD20", () => {
  it("clamps to 1..20 and truncates", () => {
    expect(clampD20(0)).toBe(1);
    expect(clampD20(25)).toBe(20);
    expect(clampD20(7.9)).toBe(7);
  });
});

describe("toDiceRoll (DESIGN §4.1)", () => {
  it("maps value to result with label/emoji/color", () => {
    expect(toDiceRoll(1).result).toBe("critical-fail");
    expect(toDiceRoll(7).result).toBe("partial-progress");
    expect(toDiceRoll(20).result).toBe("critical-success");
    const r = toDiceRoll(18);
    expect(r.label).toBe("Strong Success");
    expect(r.emoji).toBe(DICE_MAP["strong-success"].emoji);
    expect(r.color).toBe("#3B82F6");
  });
  it("clamps out-of-range values", () => {
    expect(toDiceRoll(0).result).toBe("critical-fail");
    expect(toDiceRoll(99).result).toBe("critical-success");
  });
});
