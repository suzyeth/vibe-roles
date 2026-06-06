import { describe, it, expect } from "vitest";
import { rollLabel, clampD20 } from "@/lib/dice";

describe("rollLabel", () => {
  it("边界映射正确", () => {
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
  it("夹到 1..20 且取整", () => {
    expect(clampD20(0)).toBe(1);
    expect(clampD20(25)).toBe(20);
    expect(clampD20(7.9)).toBe(7);
  });
});
