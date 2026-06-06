import { describe, it, expect } from "vitest";
import { buildQuestPrompt, buildRollPrompt, buildFateCardPrompt, buildQuestCardPrompt } from "@/lib/director";

describe("director prompts", () => {
  it("buildQuestPrompt includes members and theme, asks for JSON", () => {
    const { system, user } = buildQuestPrompt(["Xiaomin", "Emma"], "The Unread Beast");
    expect(system).toContain("JSON"); expect(user).toContain("Xiaomin"); expect(user).toContain("The Unread Beast");
  });
  it("buildRollPrompt includes label/fate/reactor and asks for JSON", () => {
    const { system, user } = buildRollPrompt("silence", "Messy Progress", [{ type: "curse", title: "Food Metaphor", effect: "x", tone: "t", trigger: "next_round" }], "earlier", [{ name: "Kai", role: "Bard" }]);
    expect(system).toContain("JSON");
    expect(user).toContain("Messy Progress");
    expect(user).toContain("Food Metaphor");
    expect(user).toContain("Kai");
  });
  it("buildFateCardPrompt includes type and input, asks for JSON", () => {
    const { system, user } = buildFateCardPrompt("curse", "everyone speaks in food metaphors");
    expect(system).toContain("JSON"); expect(user).toContain("curse"); expect(user).toContain("food metaphors");
  });
  it("buildQuestCardPrompt includes finalRoll", () => {
    const { user } = buildQuestCardPrompt("defeated the beast", 18, ["Food Metaphor"]);
    expect(user).toContain("18");
  });
});
