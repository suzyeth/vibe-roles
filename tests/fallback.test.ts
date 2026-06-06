import { describe, it, expect } from "vitest";
import { fallbackQuest, fallbackRoundResult, fallbackFateCard, fallbackQuestCard, fallbackPrologue } from "@/lib/fallback";
import { QuestSchema, FateCardSchema, RoundResultSchema, QuestCardSchema } from "@/lib/schema";

describe("fallbackQuest", () => {
  it("players count = members count and passes schema", () => {
    const q = fallbackQuest(["A", "B"]);
    expect(q.players).toHaveLength(2); expect(QuestSchema.parse(q)).toBeTruthy();
  });
  it("empty members still yields a valid quest", () => { expect(QuestSchema.parse(fallbackQuest([]))).toBeTruthy(); });
});

describe("fallbackRoundResult", () => {
  it("every roll gives non-empty narration and passes schema", () => {
    for (const r of [1, 4, 7, 13, 18, 20]) expect(RoundResultSchema.parse(fallbackRoundResult(r, []))).toBeTruthy();
  });
  it("fallbackRoundResult gives one line per reactor", () => {
    const res = fallbackRoundResult(7, [], [{ name: "Kai", role: "Bard" }, { name: "Momo", role: "Healer" }], 0);
    expect(res.reactions).toHaveLength(2);
    expect(res.reactions[0].member).toBe("Kai");
  });
});

describe("fallbackFateCard", () => {
  it("uses input as title and passes schema", () => {
    const c = fallbackFateCard("A jealous duck", 0);
    expect(c.title.length).toBeGreaterThan(0); expect(FateCardSchema.parse(c)).toBeTruthy();
  });
});

describe("fallbackQuestCard", () => {
  it("passes schema", () => { expect(QuestCardSchema.parse(fallbackQuestCard(18, "Food Metaphor"))).toBeTruthy(); });
});

describe("fallbackPrologue", () => {
  it("returns multiple non-empty lines weaving theme, heroes and goal", () => {
    const q = fallbackQuest(["Mia", "Kai"]);
    const lines = fallbackPrologue(q);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((l) => l.length > 0)).toBe(true);
    expect(lines.join(" ")).toContain("Mia");
  });
});
