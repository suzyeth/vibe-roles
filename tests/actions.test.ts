import { describe, it, expect } from "vitest";
import { buildActionsPrompt } from "@/lib/director";
import { fallbackActions } from "@/lib/fallback";
import { ActionOptionsSchema } from "@/lib/schema";

describe("buildActionsPrompt", () => {
  it("returns system and user prompts with action context", () => {
    const { system, user } = buildActionsPrompt(
      "The chat has fallen into silence.",
      "The Unread Beast stole the last topic.",
      { name: "Mia", role: "The Overthinking Wizard" }
    );
    expect(system).toContain("Roll Call Game Master");
    expect(system).toContain("2-3 concrete action options");
    expect(system).toContain("JSON ONLY");
    expect(user).toContain("Mia the The Overthinking Wizard");
    expect(user).toContain("The chat has fallen into silence");
  });

  it("works for different player roles", () => {
    const { user } = buildActionsPrompt(
      "A dark corridor stretches ahead.",
      "You hear distant footsteps.",
      { name: "Kai", role: "The Ghost Rogue" }
    );
    expect(user).toContain("Kai the The Ghost Rogue");
  });
});

describe("fallbackActions", () => {
  it("returns ActionOptions with 3 deterministic options", () => {
    const result = fallbackActions({ name: "Mia", role: "The Overthinking Wizard" }, 0);
    expect(ActionOptionsSchema.parse(result)).toEqual(result);
    expect(result.options).toBeInstanceOf(Array);
    expect(result.options.length).toBeGreaterThanOrEqual(1);
    expect(result.options.length).toBeLessThanOrEqual(3);
  });

  it("rotates options based on seed", () => {
    const r0 = fallbackActions({ name: "Kai", role: "The Ghost Rogue" }, 0);
    const r1 = fallbackActions({ name: "Kai", role: "The Ghost Rogue" }, 1);
    const r2 = fallbackActions({ name: "Kai", role: "The Ghost Rogue" }, 2);
    expect(r0.options).not.toEqual(r1.options);
    expect(r1.options).not.toEqual(r2.options);
  });

  it("provides fallback options for unknown roles", () => {
    const result = fallbackActions({ name: "You", role: "The Budget Goblin" }, 0);
    expect(result.options.length).toBeGreaterThan(0);
    expect(result.options[0]).toBeTruthy();
  });

  it("works with any seed including negative", () => {
    const result = fallbackActions({ name: "Momo", role: "The Chaos Bard" }, -5);
    expect(result.options.length).toBeGreaterThan(0);
  });
});

describe("ActionOptionsSchema", () => {
  it("validates correct structure", () => {
    const valid = { options: ["Search the room", "Use magic", "Run away"] };
    expect(ActionOptionsSchema.parse(valid)).toEqual(valid);
  });

  it("rejects empty options array", () => {
    expect(() => ActionOptionsSchema.parse({ options: [] })).toThrow();
  });

  it("rejects empty string in options", () => {
    expect(() => ActionOptionsSchema.parse({ options: ["", "Valid"] })).toThrow();
  });

  it("accepts single option", () => {
    const valid = { options: ["Just do it"] };
    expect(ActionOptionsSchema.parse(valid)).toEqual(valid);
  });

  it("accepts many options", () => {
    const valid = { options: Array(10).fill("Option") };
    expect(ActionOptionsSchema.parse(valid)).toEqual(valid);
  });
});