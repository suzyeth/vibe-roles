import { describe, it, expect } from "vitest";
import { QuestSchema, FateCardSchema, QuestCardSchema, PlayerSchema } from "@/lib/schema";

const quest = {
  scene: { theme: "The Unread Beast", setup: "silence...", tone: "playful" },
  players: [{ name: "Xiaomin", role: "Wizard", ability: "detect awkwardness", status: "active" }],
  goal: "revive chat",
};

describe("QuestSchema", () => {
  it("accepts a valid quest", () => { expect(QuestSchema.parse(quest)).toBeTruthy(); });
  it("rejects empty players", () => { expect(() => QuestSchema.parse({ ...quest, players: [] })).toThrow(); });
});

describe("FateCardSchema", () => {
  it("accepts valid input and applies defaults", () => {
    const c = FateCardSchema.parse({ type: "curse", title: "Food Metaphor", effect: "..." });
    expect(c.tone).toBe("chaotic but harmless"); expect(c.trigger).toBe("next_round");
  });
  it("rejects a non-whitelisted type", () => { expect(() => FateCardSchema.parse({ type: "explosion", title: "x", effect: "y" })).toThrow(); });
});

describe("QuestCardSchema", () => {
  it("accepts a valid questcard", () => { expect(QuestCardSchema.parse({ title: "Quest Completed", caption: "alive", best_interference: "Food Metaphor", final_roll: 18, cta: "open zymix" })).toBeTruthy(); });
});

describe("PlayerSchema", () => {
  it("status defaults to active", () => { expect(PlayerSchema.parse({ name: "A", role: "R", ability: "x" }).status).toBe("active"); });
});

describe("RoundResultSchema", () => {
  it("RoundResultSchema defaults reactions to []", async () => {
    const { RoundResultSchema } = await import("@/lib/schema");
    expect(RoundResultSchema.parse({ narration: "x" }).reactions).toEqual([]);
  });
});
