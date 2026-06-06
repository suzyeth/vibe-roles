import { describe, it, expect } from "vitest";
import { buildQuestPrompt, buildRollPrompt, buildFateCardPrompt, buildQuestCardPrompt, buildPartyPrompt } from "@/lib/director";

describe("director prompts", () => {
  it("buildQuestPrompt 含成员与主题，要求 JSON", () => {
    const { system, user } = buildQuestPrompt(["Xiaomin", "Emma"], "The Unread Beast");
    expect(system).toContain("JSON"); expect(user).toContain("Xiaomin"); expect(user).toContain("The Unread Beast");
  });
  it("buildRollPrompt 含 roll 标签与 fate 标题", () => {
    const { user } = buildRollPrompt("silence", "Messy Progress", [{ type: "curse", title: "Food Metaphor", effect: "x", tone: "t", trigger: "next_round" }], "前情");
    expect(user).toContain("Messy Progress"); expect(user).toContain("Food Metaphor");
  });
  it("buildFateCardPrompt 含类型与输入，要求 JSON", () => {
    const { system, user } = buildFateCardPrompt("curse", "everyone speaks in food metaphors");
    expect(system).toContain("JSON"); expect(user).toContain("curse"); expect(user).toContain("food metaphors");
  });
  it("buildQuestCardPrompt 含 finalRoll", () => {
    const { user } = buildQuestCardPrompt("打败了野兽", 18, ["Food Metaphor"]);
    expect(user).toContain("18");
  });
  it("buildPartyPrompt 含队友名单与 roll 标签，要求 JSON", () => {
    const { system, user } = buildPartyPrompt(["小鹿", "阿K"], "silence", "Total Chaos", "前情");
    expect(system).toContain("JSON");
    expect(user).toContain("小鹿"); expect(user).toContain("阿K"); expect(user).toContain("Total Chaos");
  });
});
