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
  type RoleEvent,
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
  eventTarget?: string,
): { nextId: string; success: boolean } {
  const node = story.nodes[nodeId];
  if (!node) return { nextId: nodeId, success: false };
  const i = Math.max(0, Math.min(Math.floor(choiceIndex), node.choices.length - 1));
  const choice = node.choices[i];
  const success = clampD20(roll) >= WIN_THRESHOLD;
  if (eventTarget) return { nextId: eventTarget, success };
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

/** A teammate roll considered for event selection. */
export interface TeammateRoll {
  name: string;
  role: string;
  roll: number;
}

/** The event chosen for a round (or null if none fired). */
export interface SelectedTeammateEvent {
  actorName: string;
  role: string;
  kind: "boon" | "chaos";
  event: RoleEvent;
}

/** A teammate roll at/above this fires that member's boon event. */
export const BOON_THRESHOLD = 15;
/** A teammate roll at/below this fires that member's chaos event (if no boon). */
export const CHAOS_THRESHOLD = 6;

/**
 * Pick at most one teammate event for the round from the teammates' rolls.
 * Boon (highest roll >= BOON_THRESHOLD) wins; else chaos (lowest <= CHAOS_THRESHOLD);
 * else null. The member's `roleEvents[name]` resolves the event, falling back to
 * `defaultRoleEvent` for unknown members.
 */
export function selectTeammateEvent(
  story: BranchingStory,
  rolls: TeammateRoll[],
): SelectedTeammateEvent | null {
  const eventsFor = (name: string) => story.roleEvents[name] ?? story.defaultRoleEvent;

  const boons = rolls.filter((r) => clampD20(r.roll) >= BOON_THRESHOLD);
  if (boons.length) {
    const top = boons.reduce((b, r) => (r.roll > b.roll ? r : b));
    return { actorName: top.name, role: top.role, kind: "boon", event: eventsFor(top.name).boon };
  }

  const chaoses = rolls.filter((r) => clampD20(r.roll) <= CHAOS_THRESHOLD);
  if (chaoses.length) {
    const low = chaoses.reduce((b, r) => (r.roll < b.roll ? r : b));
    return { actorName: low.name, role: low.role, kind: "chaos", event: eventsFor(low.name).chaos };
  }

  return null;
}

/** A teammate event that actually fired during a run (for the ending card). */
export interface LoggedEvent {
  round: number;
  actorName: string;
  role: string;
  kind: "boon" | "chaos";
  line: string;
  coda: string;
  fromNode: string;
  toNode: string;
}

/**
 * The single most impactful event of a run: a boon beats a chaos; among the same
 * kind the latest one wins (closest to the ending it led into). Null if empty.
 */
export function pickPivotalEvent(log: LoggedEvent[]): LoggedEvent | null {
  if (!log.length) return null;
  const latest = (arr: LoggedEvent[]) => arr.reduce((b, e) => (e.round >= b.round ? e : b));
  const boons = log.filter((e) => e.kind === "boon");
  if (boons.length) return latest(boons);
  return latest(log);
}
