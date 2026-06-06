import { describe, it, expect } from "vitest";
import { buildProloguePrompt, fallbackPrologue, PrologueSchema } from "@/lib/prologue";
import type { Quest } from "@/lib/schema";

const quest: Quest = {
  scene: { theme: "The Unread Beast", setup: "The chat fell silent.", tone: "playful" },
  players: [
    { name: "You", role: "Wizard", ability: "detect awkwardness", status: "active" },
    { name: "Mia", role: "Bard", ability: "turn silence into a song", status: "active" },
  ],
  goal: "Revive the chat.",
};

describe("fallbackPrologue", () => {
  it("returns multiple non-empty lines and passes schema", () => {
    const lines = fallbackPrologue(quest);
    expect(lines.length).toBeGreaterThan(1);
    expect(PrologueSchema.parse({ lines })).toBeTruthy();
  });
  it("weaves in theme, hero names and goal", () => {
    const text = fallbackPrologue(quest).join(" ");
    expect(text).toContain("The Unread Beast");
    expect(text).toContain("Mia");
    expect(text).toContain("Revive the chat");
  });
});

describe("buildProloguePrompt", () => {
  it("asks for JSON and includes theme + heroes", () => {
    const { system, user } = buildProloguePrompt(quest);
    expect(system).toContain("JSON");
    expect(user).toContain("The Unread Beast");
    expect(user).toContain("Mia the Bard");
  });
});
