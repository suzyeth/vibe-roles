import { describe, it, expect } from "vitest";
import { TEST_STORIES, TEST_STORY_THEMES } from "@/data/testStories";
import {
  pickTestStory,
  testBeat,
  testQuestPlayers,
  testActions,
  testNarration,
  testReactions,
  testRoundResult,
  testQuestCard,
} from "@/lib/testEngine";
import { PlayerSchema, RoundResultSchema, QuestCardSchema } from "@/lib/schema";

describe("TEST_STORIES data integrity", () => {
  it("has at least 4 stories, each well-formed", () => {
    expect(TEST_STORIES.length).toBeGreaterThanOrEqual(4);
    for (const s of TEST_STORIES) {
      expect(s.key.length).toBeGreaterThan(0);
      expect(s.theme.length).toBeGreaterThan(0);
      expect(s.prologue.length).toBeGreaterThanOrEqual(1);
      expect(s.prologue.length).toBeLessThanOrEqual(3);
      expect(s.reactions.length).toBeGreaterThan(0);
      expect(s.beats.length).toBeGreaterThanOrEqual(5); // covers minRounds for 4–5 players
      expect(s.roles.You).toBeTruthy(); // the human always has a scripted role
      expect(s.ending.title.length).toBeGreaterThan(0);
    }
  });

  it("every beat has 3+ options and both narration branches", () => {
    for (const s of TEST_STORIES) {
      for (const b of s.beats) {
        expect(b.youOptions.length).toBeGreaterThanOrEqual(3);
        expect(b.good.length).toBeGreaterThan(0);
        expect(b.bad.length).toBeGreaterThan(0);
      }
    }
  });

  it("story keys and themes are unique", () => {
    expect(new Set(TEST_STORIES.map((s) => s.key)).size).toBe(TEST_STORIES.length);
    expect(new Set(TEST_STORY_THEMES).size).toBe(TEST_STORIES.length);
  });
});

describe("pickTestStory", () => {
  it("matches by theme or key, else rotates by seed", () => {
    const first = TEST_STORIES[0];
    expect(pickTestStory(first.theme).key).toBe(first.key);
    expect(pickTestStory(first.key).key).toBe(first.key);
    // unknown theme falls back deterministically and never throws
    expect(pickTestStory("not a real theme", 1).key).toBe(TEST_STORIES[1].key);
    // negative / huge seeds stay in range
    expect(pickTestStory(undefined, -3)).toBeTruthy();
    expect(pickTestStory(undefined, 9999)).toBeTruthy();
  });
});

describe("testQuestPlayers", () => {
  it("assigns scripted roles and passes PlayerSchema", () => {
    const story = TEST_STORIES[0];
    const players = testQuestPlayers(story, ["Mia", "Kai", "Momo", "You"]);
    expect(players).toHaveLength(4);
    for (const p of players) expect(PlayerSchema.parse(p)).toBeTruthy();
    expect(players.find((p) => p.name === "You")!.role).toBe(story.roles.You.role);
  });

  it("unknown names get the default role", () => {
    const story = TEST_STORIES[0];
    const [p] = testQuestPlayers(story, ["Randomer"]);
    expect(p.role).toBe(story.defaultRole.role);
    expect(PlayerSchema.parse(p)).toBeTruthy();
  });
});

describe("testBeat / testActions", () => {
  it("clamps past the last beat instead of throwing", () => {
    const story = TEST_STORIES[0];
    const last = story.beats[story.beats.length - 1];
    expect(testBeat(story, 999)).toBe(last);
    expect(testActions(story, 999).length).toBeGreaterThanOrEqual(1);
  });

  it("returns at most 3 options", () => {
    expect(testActions(TEST_STORIES[0], 0).length).toBeLessThanOrEqual(3);
  });
});

describe("testNarration branching", () => {
  it("11+ takes good, 10- takes bad", () => {
    const story = TEST_STORIES[0];
    const beat = story.beats[1]; // a beat without crit/flop overrides
    expect(testNarration(story, 1, 14)).toBe(beat.good);
    expect(testNarration(story, 1, 4)).toBe(beat.bad);
  });

  it("nat 20 / nat 1 use crit / flop when present", () => {
    const story = TEST_STORIES[0];
    const beat = story.beats[0];
    if (beat.crit) expect(testNarration(story, 0, 20)).toBe(beat.crit);
    if (beat.flop) expect(testNarration(story, 0, 1)).toBe(beat.flop);
  });
});

describe("testReactions / testRoundResult", () => {
  it("one reaction per reactor, varied lines, passes schema", () => {
    const story = TEST_STORIES[0];
    const reactors = [{ name: "Kai" }, { name: "Momo" }];
    const res = testRoundResult(story, 0, 13, reactors, 0);
    expect(res.reactions).toHaveLength(2);
    expect(res.reactions[0].member).toBe("Kai");
    expect(res.reactions[0].text).not.toBe(res.reactions[1].text);
    expect(RoundResultSchema.parse(res)).toBeTruthy();
  });

  it("testReactions handles no reactors", () => {
    expect(testReactions(TEST_STORIES[0], [])).toHaveLength(0);
  });
});

describe("testQuestCard", () => {
  it("uses the scripted ending and passes schema", () => {
    const story = TEST_STORIES[0];
    const card = testQuestCard(story, 18, "The Sunglasses Pigeon");
    expect(card.title).toBe(story.ending.title);
    expect(card.best_interference).toBe("The Sunglasses Pigeon");
    expect(QuestCardSchema.parse(card)).toBeTruthy();
  });

  it("falls back to a non-empty best_interference", () => {
    const card = testQuestCard(TEST_STORIES[0], 7, "");
    expect(card.best_interference.length).toBeGreaterThan(0);
    expect(QuestCardSchema.parse(card)).toBeTruthy();
  });
});
