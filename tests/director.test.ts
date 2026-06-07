import { describe, it, expect } from "vitest";
import { buildQuestPrompt, buildRollPrompt, buildFateCardPrompt, buildQuestCardPrompt, buildProloguePrompt, padWithNPCs } from "@/lib/director";
import type { Quest } from "@/lib/schema";

describe("padWithNPCs", () => {
  it("pads 1 player up to 3 (adds 2 NPCs)", () => {
    const result = padWithNPCs(["Mia"]);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("Mia");
    expect(result).toContain("Mia");
  });
  it("pads 2 players up to 3 (adds 1 NPC)", () => {
    const result = padWithNPCs(["Mia", "Kai"]);
    expect(result).toHaveLength(3);
    expect(result).toContain("Mia");
    expect(result).toContain("Kai");
  });
  it("does not pad 3 or more players", () => {
    const result = padWithNPCs(["Mia", "Kai", "Momo"]);
    expect(result).toHaveLength(3);
    const more = padWithNPCs(["Mia", "Kai", "Momo", "Emma"]);
    expect(more).toHaveLength(4);
  });
  it("empty array returns at least one entry", () => {
    const result = padWithNPCs([]);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe("director prompts", () => {
  it("buildQuestPrompt includes members and theme, asks for JSON", () => {
    const { system, user } = buildQuestPrompt(["Xiaomin", "Emma"], "The Unread Beast");
    expect(system).toContain("JSON"); expect(user).toContain("Xiaomin"); expect(user).toContain("The Unread Beast");
  });
  it("buildRollPrompt includes label/fate/reactor and asks for JSON", () => {
    const { system, user } = buildRollPrompt("silence", "Partial Progress", [{ type: "rule", title: "Food Metaphor", effect: "x", tone: "t", trigger: "next_round" }], "earlier", [{ name: "Kai", role: "Bard" }]);
    expect(system).toContain("JSON");
    expect(user).toContain("Partial Progress");
    expect(user).toContain("Food Metaphor");
    expect(user).toContain("Kai");
  });
  it("buildFateCardPrompt includes type and input, asks for JSON", () => {
    const { system, user } = buildFateCardPrompt("rule", "everyone speaks in food metaphors");
    expect(system).toContain("JSON"); expect(user).toContain("rule"); expect(user).toContain("food metaphors");
  });
  it("buildQuestCardPrompt includes finalRoll", () => {
    const { user } = buildQuestCardPrompt("defeated the beast", 18, ["Food Metaphor"]);
    expect(user).toContain("18");
  });
  it("buildProloguePrompt includes theme + heroes and asks for JSON", () => {
    const quest: Quest = {
      scene: { theme: "The Unread Beast", setup: "silence", tone: "playful" },
      players: [{ name: "Mia", role: "Bard", ability: "x", status: "active" }],
      goal: "Revive the chat.",
    };
    const { system, user } = buildProloguePrompt(quest);
    expect(system).toContain("JSON");
    expect(user).toContain("The Unread Beast");
    expect(user).toContain("Mia the Bard");
  });
});
