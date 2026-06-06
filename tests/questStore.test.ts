import { describe, it, expect } from "vitest";
import { createQuest, getQuest, addFateCard, listFateCards } from "@/lib/questStore";

const quest = { scene: { theme: "t", setup: "s", tone: "x" }, players: [{ name: "A", role: "R", ability: "y", status: "active" as const }], goal: "g" };

describe("questStore", () => {
  it("create + get", () => { createQuest("q1", quest); expect(getQuest("q1")?.quest.goal).toBe("g"); });
  it("addFateCard returns false for a missing id", () => { expect(addFateCard("nope", { type: "curse", title: "t", effect: "e", tone: "x", trigger: "next_round" })).toBe(false); });
  it("addFateCard appends + listFateCards", () => {
    createQuest("q2", quest);
    addFateCard("q2", { type: "object", title: "umbrella", effect: "e", tone: "x", trigger: "next_round" });
    expect(listFateCards("q2")).toHaveLength(1);
  });
});
