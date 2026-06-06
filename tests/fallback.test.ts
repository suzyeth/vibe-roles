import { describe, it, expect } from "vitest";
import { fallbackQuest, fallbackRoundResult, fallbackFateCard, fallbackQuestCard, fallbackPartyLines } from "@/lib/fallback";
import { QuestSchema, FateCardSchema, RoundResultSchema, QuestCardSchema, PartyLinesSchema } from "@/lib/schema";

describe("fallbackQuest", () => {
  it("players 数=成员数且通过 schema", () => {
    const q = fallbackQuest(["A", "B"]);
    expect(q.players).toHaveLength(2); expect(QuestSchema.parse(q)).toBeTruthy();
  });
  it("空成员也产出合法 quest", () => { expect(QuestSchema.parse(fallbackQuest([]))).toBeTruthy(); });
});

describe("fallbackRoundResult", () => {
  it("各 roll 都给非空旁白且通过 schema", () => {
    for (const r of [1, 4, 7, 13, 18, 20]) expect(RoundResultSchema.parse(fallbackRoundResult(r, []))).toBeTruthy();
  });
});

describe("fallbackFateCard", () => {
  it("用输入做标题且通过 schema", () => {
    const c = fallbackFateCard("A jealous duck", 0);
    expect(c.title.length).toBeGreaterThan(0); expect(FateCardSchema.parse(c)).toBeTruthy();
  });
});

describe("fallbackQuestCard", () => {
  it("通过 schema", () => { expect(QuestCardSchema.parse(fallbackQuestCard(18, "Food Metaphor"))).toBeTruthy(); });
});

describe("fallbackPartyLines", () => {
  it("每个队友各一句且通过 schema", () => {
    const lines = fallbackPartyLines(["小鹿", "阿K", "Momo"], "Iconic Roll", 3);
    expect(lines).toHaveLength(3);
    expect(lines.map((l) => l.name)).toEqual(["小鹿", "阿K", "Momo"]);
    expect(PartyLinesSchema.parse({ lines })).toBeTruthy();
  });
  it("空队友返回空数组", () => { expect(fallbackPartyLines([], "Total Chaos", 0)).toHaveLength(0); });
  it("未知 label 也给非空台词", () => {
    expect(fallbackPartyLines(["A"], "???", 1)[0].text.length).toBeGreaterThan(0);
  });
});
