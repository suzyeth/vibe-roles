import { describe, it, expect } from "vitest";
import { createQuest, getQuest, addFateCard, listFateCards, getStoryState, mergeStoryState } from "@/lib/questStore";

const quest = { scene: { theme: "t", setup: "s", tone: "x" }, players: [{ name: "A", role: "R", ability: "y", status: "active" as const }], goal: "g" };

describe("questStore", () => {
  it("create + get", () => { createQuest("q1", quest); expect(getQuest("q1")?.quest.goal).toBe("g"); });
  it("addFateCard returns false for a missing id", () => { expect(addFateCard("nope", { type: "rule", title: "t", effect: "e", tone: "x", trigger: "next_round" })).toBe(false); });
  it("addFateCard appends + listFateCards", () => {
    createQuest("q2", quest);
    addFateCard("q2", { type: "object", title: "umbrella", effect: "e", tone: "x", trigger: "next_round" });
    expect(listFateCards("q2")).toHaveLength(1);
  });
});

describe("story state", () => {
  it("merges clues/status/relationships into the quest's story state", () => {
    createQuest("qs", quest);
    mergeStoryState("qs", { known_clues: ["receipt says 404"], character_status: { Kai: "has evidence" }, relationships: ["Luna doubts Kai"] });
    const s = getStoryState("qs");
    expect(s.known_clues).toContain("receipt says 404");
    expect(s.character_status.Kai).toBe("has evidence");
    expect(s.relationships).toContain("Luna doubts Kai");
  });
  it("returns an empty state for an unknown id", () => {
    expect(getStoryState("nope").known_clues).toEqual([]);
  });
});
