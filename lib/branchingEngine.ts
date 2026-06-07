/**
 * branchingEngine.ts — pure traversal for the branching story model.
 *
 * Turns a {@link BranchingStory} graph into the shapes the game loop needs:
 * the current node's scene + choices, and — given a choice + a D20 roll — the
 * next node id (success routes one way, failure another). Deterministic and
 * network-free, so Test Mode stays instant. See data/branchingStories.ts.
 */
import {
  BRANCHING_STORIES,
  type BranchingStory,
  type BranchNode,
  type BranchEnding,
  type BranchChoice,
} from "@/data/branchingStories";
import type { Player } from "@/lib/schema";
import { clampD20 } from "@/lib/dice";

/** Roll 11+ (Success or better) takes the onSuccess branch. */
const WIN_THRESHOLD = 11;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Pick a story: exact theme/key match wins, else rotate by seed. */
export function pickBranchingStory(theme: string | undefined, seed = 0): BranchingStory {
  if (theme) {
    const match = BRANCHING_STORIES.find((s) => s.theme === theme || s.key === theme);
    if (match) return match;
  }
  return BRANCHING_STORIES[mod(Math.floor(seed), BRANCHING_STORIES.length)];
}

/** Assign each member their scripted role; unknown names get the default. */
export function branchPlayers(story: BranchingStory, members: string[]): Player[] {
  const names = members.length ? members : ["You"];
  return names.map((name) => {
    const r = story.roles[name] ?? story.defaultRole;
    return { name, role: r.role, ability: r.ability, status: "active" as const };
  });
}

/** Character detail line for a name (for the in-chat role assignment). */
export function branchDetail(story: BranchingStory, name: string): string {
  return (story.roles[name] ?? story.defaultRole).detail;
}

export function isEnding(story: BranchingStory, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(story.endings, id);
}

export function getNode(story: BranchingStory, id: string): BranchNode | undefined {
  return story.nodes[id];
}

export function getEnding(story: BranchingStory, id: string): BranchEnding | undefined {
  return story.endings[id];
}

/** The protagonist's choice labels at a node (with emoji prefix if present). */
export function nodeChoiceLabels(node: BranchNode): string[] {
  return node.choices.map((c) => (c.emoji ? `${c.emoji} ${c.label}` : c.label));
}

/**
 * Resolve a choice + roll into the next node id.
 * `choiceIndex` is clamped; success (D20>=11) follows onSuccess, else onFail.
 */
export function advance(
  story: BranchingStory,
  nodeId: string,
  choiceIndex: number,
  roll: number,
): { nextId: string; success: boolean } {
  const node = story.nodes[nodeId];
  if (!node) return { nextId: nodeId, success: false };
  const i = Math.max(0, Math.min(Math.floor(choiceIndex), node.choices.length - 1));
  const choice = node.choices[i];
  const success = clampD20(roll) >= WIN_THRESHOLD;
  return { nextId: success ? choice.onSuccess : choice.onFail, success };
}

/**
 * Get the choices for the current node. Single source of truth = node.choices;
 * `_actorName` is kept for API compatibility (the AI members don't fork the
 * tree — only the protagonist's choice routes the story).
 */
export function getRoleSpecificChoices(
  story: BranchingStory,
  nodeId: string,
  _actorName: string,
): BranchChoice[] {
  return story.nodes[nodeId]?.choices ?? [];
}

/**
 * Get choices for the current actor (role-specific or generic).
 * This is the main function called by the UI.
 */
export function getChoicesForActor(
  story: BranchingStory,
  nodeId: string,
  actorName: string,
): Array<{ label: string; emoji?: string }> {
  const choices = getRoleSpecificChoices(story, nodeId, actorName);
  return choices.map((c) => ({ label: c.label, emoji: c.emoji }));
}
