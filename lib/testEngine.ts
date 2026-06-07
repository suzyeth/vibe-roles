/**
 * testEngine.ts — pure logic for Test Mode (fallback safety net).
 *
 * Turns a pre-written {@link TestStory} into the same shapes the live GLM path
 * produces (Quest players, action options, RoundResult, QuestCard) — but with
 * zero network and zero LLM. Deterministic given its inputs, so it's easy to
 * test and a demo never stalls. See {@link file://../data/testStories.ts}.
 */
import { TEST_STORIES, type TestStory, type TestBeat } from "@/data/testStories";
import type { Player, RoundResult, QuestCard } from "@/lib/schema";
import { clampD20 } from "@/lib/dice";

/** Rolls of 11+ (Success or better) take the "good" narration branch. */
const WIN_THRESHOLD = 11;

/** Non-negative modulo, so negative seeds still index safely. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Pick a story. An exact theme/key match wins; otherwise rotate by seed so
 * repeat plays vary. Never returns undefined (TEST_STORIES is non-empty).
 */
export function pickTestStory(theme: string | undefined, seed = 0): TestStory {
  if (theme) {
    const match = TEST_STORIES.find((s) => s.theme === theme || s.key === theme);
    if (match) return match;
  }
  return TEST_STORIES[mod(Math.floor(seed), TEST_STORIES.length)];
}

/** The beat for a given round, clamped to the last beat if the quest overruns. */
export function testBeat(story: TestStory, round: number): TestBeat {
  const i = Math.max(0, Math.min(Math.floor(round), story.beats.length - 1));
  return story.beats[i];
}

/**
 * Assign each member their scripted role. Unknown names get the story's
 * defaultRole. "You" stays active (the human); everyone else is an active AI
 * stand-in so the turn loop still cycles through them.
 */
export function testQuestPlayers(story: TestStory, members: string[]): Player[] {
  const names = members.length ? members : ["You"];
  return names.map((name) => {
    const r = story.roles[name] ?? story.defaultRole;
    return { name, role: r.role, ability: r.ability, status: "active" as const };
  });
}

/** Action options for the human turn at this round (max 3, like the live path). */
export function testActions(story: TestStory, round: number): string[] {
  return testBeat(story, round).youOptions.slice(0, 3);
}

/**
 * Narration for a resolved roll. Branches: nat 20 → crit (if present), nat 1 →
 * flop (if present), otherwise good (11+) / bad (10-).
 */
export function testNarration(story: TestStory, round: number, roll: number): string {
  const beat = testBeat(story, round);
  const v = clampD20(roll);
  if (v >= 20 && beat.crit) return beat.crit;
  if (v <= 1 && beat.flop) return beat.flop;
  return v >= WIN_THRESHOLD ? beat.good : beat.bad;
}

/** Rotate the story's gossip pool so each reactor gets a distinct, varied line. */
export function testReactions(
  story: TestStory,
  reactors: { name: string }[],
  seed = 0,
): { member: string; text: string }[] {
  const pool = story.reactions;
  return reactors.map((r, i) => ({
    member: r.name,
    text: pool[mod(Math.floor(seed) * 2 + i, pool.length)],
  }));
}

/** A full scripted RoundResult (matches the live /api/roll contract shape). */
export function testRoundResult(
  story: TestStory,
  round: number,
  roll: number,
  reactors: { name: string }[] = [],
  seed = 0,
): RoundResult {
  return {
    narration: testNarration(story, round, roll),
    reactions: testReactions(story, reactors, seed),
    consequence: "",
    story_state_updates: {},
    advance: true,
  };
}

/** The shareable ending card, drawn from the story's scripted ending. */
export function testQuestCard(
  story: TestStory,
  finalRoll: number,
  bestInterference = "",
): QuestCard {
  return {
    title: story.ending.title,
    caption: story.ending.caption,
    best_interference: bestInterference || story.ending.caption,
    final_roll: Math.floor(finalRoll),
    cta: story.ending.cta,
  };
}
