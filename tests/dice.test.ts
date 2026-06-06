import { describe, it, expect } from "vitest";
import { rollLabel, clampD20 } from "@/lib/dice";

describe("rollLabel", () => {
  it("maps boundaries correctly", () => {
    expect(rollLabel(1)).toBe("Total Chaos");
    expect(rollLabel(5)).toBe("Awkward Fail");
    expect(rollLabel(6)).toBe("Messy Progress");
    expect(rollLabel(10)).toBe("Messy Progress");
    expect(rollLabel(11)).toBe("Works Somehow");
    expect(rollLabel(15)).toBe("Works Somehow");
    expect(rollLabel(16)).toBe("Main Character Moment");
    expect(rollLabel(19)).toBe("Main Character Moment");
    expect(rollLabel(20)).toBe("Iconic Roll");
  });
});

describe("clampD20", () => {
  it("clamps to 1..20 and truncates", () => {
    expect(clampD20(0)).toBe(1);
    expect(clampD20(25)).toBe(20);
    expect(clampD20(7.9)).toBe(7);
  });
});
