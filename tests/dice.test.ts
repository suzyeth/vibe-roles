import { describe, it, expect } from "vitest";
import {
  rollLabel,
  clampD20,
  toDiceRoll,
  DICE_MAP,
  npcBiasedValue,
  rollNPCValue,
  successRate,
  endingProbability,
  shouldEndQuest,
} from "@/lib/dice";

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

// --- ported from vibe-dice demo: NPC dice bias ---
describe("npcBiasedValue", () => {
  it("adds the bonus to the base", () => {
    expect(npcBiasedValue(10, 2)).toBe(12);
    expect(npcBiasedValue(7, 0)).toBe(7);
  });
  it("clamps to the 1..20 range", () => {
    expect(npcBiasedValue(19, 2)).toBe(20);
    expect(npcBiasedValue(20, 2)).toBe(20);
  });
});

describe("rollNPCValue", () => {
  it("always returns a valid D20 value", () => {
    for (let i = 0; i < 200; i++) {
      const v = rollNPCValue();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(20);
    }
  });
});

// --- ported from vibe-dice demo: dynamic story ending ---
describe("successRate", () => {
  it("defaults to 0.5 with no rolls", () => {
    expect(successRate([])).toBe(0.5);
  });
  it("counts rolls >= 11 (Success and above) as wins", () => {
    expect(successRate([20, 20])).toBe(1);
    expect(successRate([1, 5])).toBe(0);
    expect(successRate([11, 5])).toBe(0.5);
  });
});

describe("endingProbability", () => {
  it("is 0 before everyone has acted at least once", () => {
    expect(endingProbability(2, 4, [])).toBe(0);
  });
  it("is 1 once the hard cap (2x players) is reached", () => {
    expect(endingProbability(8, 4, [1, 1])).toBe(1);
  });
  it("rises with progress through the dynamic window", () => {
    const early = endingProbability(4, 4, [20]);
    const late = endingProbability(7, 4, [20]);
    expect(late).toBeGreaterThan(early);
  });
  it("is higher when the party is succeeding", () => {
    const winning = endingProbability(6, 4, [20, 20, 20]);
    const losing = endingProbability(6, 4, [1, 1, 1]);
    expect(winning).toBeGreaterThan(losing);
  });
});

describe("shouldEndQuest", () => {
  it("never ends before everyone has acted once", () => {
    expect(shouldEndQuest(2, 4, [20, 20], () => 0)).toBe(false);
  });
  it("always ends at the hard cap regardless of randomness", () => {
    expect(shouldEndQuest(8, 4, [1], () => 0.999)).toBe(true);
  });
  it("ends inside the window when the random draw is below probability", () => {
    expect(shouldEndQuest(6, 4, [20, 20, 20], () => 0)).toBe(true);
  });
  it("continues inside the window when the random draw is above probability", () => {
    expect(shouldEndQuest(5, 4, [1, 1], () => 0.999)).toBe(false);
  });
});
