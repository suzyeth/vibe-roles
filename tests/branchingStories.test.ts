import { describe, it, expect } from "vitest";
import { BRANCHING_STORIES } from "@/data/branchingStories";

describe("branching stories — structural integrity", () => {
  for (const story of BRANCHING_STORIES) {
    describe(story.theme, () => {
      const nodeIds = new Set(Object.keys(story.nodes));
      const endingIds = new Set(Object.keys(story.endings));
      const validTarget = (id: string) => nodeIds.has(id) || endingIds.has(id);

      it("start points to a real node", () => {
        expect(nodeIds.has(story.start)).toBe(true);
      });

      it("has a hex accent colour", () => {
        expect(story.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      });

      it("has themed twist examples for the invite sheet", () => {
        expect(story.twists.length).toBeGreaterThanOrEqual(3);
        for (const tw of story.twists) {
          expect(tw.icon, "twist icon").toBeTruthy();
          expect(tw.title, "twist title").toBeTruthy();
          expect(tw.detail, "twist detail").toBeTruthy();
        }
      });

      it("every node has exactly 2 choices with valid targets", () => {
        for (const [id, node] of Object.entries(story.nodes)) {
          expect(node.id, `node ${id} id mismatch`).toBe(id);
          expect(node.choices.length, `node ${id} choice count`).toBe(2);
          for (const c of node.choices) {
            expect(validTarget(c.onSuccess), `${id} → onSuccess '${c.onSuccess}'`).toBe(true);
            expect(validTarget(c.onFail), `${id} → onFail '${c.onFail}'`).toBe(true);
          }
        }
      });

      it("has no leftover roleChoices_* duplication", () => {
        const leftover = Object.keys(story).filter((k) => k.startsWith("roleChoices_"));
        expect(leftover).toEqual([]);
      });

      it("every node is reachable from start (or via a teammate event)", () => {
        const seen = new Set<string>();
        // Teammate-event nodes are entered via the event-reroute mechanism, not the
        // choice graph — seed the traversal with those entry points too.
        const eventTargets = [
          ...Object.values(story.roleEvents),
          story.defaultRoleEvent,
        ].flatMap((re) => [re.boon.target, re.chaos.target]);
        const stack = [story.start, ...eventTargets];
        while (stack.length) {
          const id = stack.pop()!;
          if (seen.has(id) || endingIds.has(id)) continue;
          seen.add(id);
          const node = story.nodes[id];
          if (!node) continue;
          for (const c of node.choices) {
            stack.push(c.onSuccess, c.onFail);
          }
        }
        const unreachable = Array.from(nodeIds).filter((id) => !seen.has(id));
        expect(unreachable, `unreachable nodes: ${unreachable.join(", ")}`).toEqual([]);
      });

      it("every ending is reachable from start", () => {
        const seen = new Set<string>();
        const reachedEndings = new Set<string>();
        const stack = [story.start];
        while (stack.length) {
          const id = stack.pop()!;
          if (endingIds.has(id)) { reachedEndings.add(id); continue; }
          if (seen.has(id)) continue;
          seen.add(id);
          const node = story.nodes[id];
          if (!node) continue;
          for (const c of node.choices) {
            stack.push(c.onSuccess, c.onFail);
          }
        }
        const unreached = Array.from(endingIds).filter((id) => !reachedEndings.has(id));
        expect(unreached, `unreachable endings: ${unreached.join(", ")}`).toEqual([]);
      });
    });
  }
});
