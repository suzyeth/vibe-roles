import { describe, it, expect } from 'vitest';
import { BRANCHING_STORIES } from '@/data/branchingStories';
import {
  selectTeammateEvent,
  pickPivotalEvent,
  pickBranchingStory,
  advance,
  type LoggedEvent,
} from '@/lib/branchingEngine';

const TEAMMATES = ['Mia', 'Kai', 'Momo'];

describe('story event data integrity', () => {
  for (const story of BRANCHING_STORIES) {
    describe(story.key, () => {
      it('has a named crisis meter and short goal', () => {
        expect(story.crisisMeter?.name?.length).toBeGreaterThan(0);
        expect(story.crisisMeter?.emoji?.length).toBeGreaterThan(0);
        expect(story.goalShort?.length).toBeGreaterThan(0);
      });

      it('has roleEvents for every teammate plus a default', () => {
        for (const name of TEAMMATES) {
          expect(story.roleEvents[name], `${name} roleEvents`).toBeTruthy();
        }
        expect(story.defaultRoleEvent).toBeTruthy();
      });

      it('every event has non-empty line + coda and a resolvable target', () => {
        const ids = new Set([
          ...Object.keys(story.nodes),
          ...Object.keys(story.endings),
        ]);
        const all = [
          ...Object.values(story.roleEvents),
          story.defaultRoleEvent,
        ];
        for (const re of all) {
          for (const ev of [re.boon, re.chaos]) {
            expect(ev.line.length).toBeGreaterThan(0);
            expect(ev.coda.length).toBeGreaterThan(0);
            expect(ids.has(ev.target), `target ${ev.target}`).toBe(true);
          }
        }
      });

      it('every node choice points to a real node or ending', () => {
        const ids = new Set([
          ...Object.keys(story.nodes),
          ...Object.keys(story.endings),
        ]);
        for (const node of Object.values(story.nodes)) {
          for (const c of node.choices) {
            expect(ids.has(c.onSuccess), `${node.id}.onSuccess ${c.onSuccess}`).toBe(true);
            expect(ids.has(c.onFail), `${node.id}.onFail ${c.onFail}`).toBe(true);
          }
        }
      });
    });
  }
});

describe('selectTeammateEvent', () => {
  const story = pickBranchingStory('group-chat-trial');
  const roll = (name: string, role: string, roll: number) => ({ name, role, roll });

  it('fires a boon for the highest roll >= 15', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 16), roll('Mia', 'y', 8)]);
    expect(sel?.kind).toBe('boon');
    expect(sel?.actorName).toBe('Kai');
    expect(sel?.event.target).toBe('kai_receipt');
  });

  it('picks the highest among multiple boons', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 15), roll('Mia', 'y', 19)]);
    expect(sel?.actorName).toBe('Mia');
  });

  it('fires a chaos for the lowest roll <= 6 when no boon', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 9), roll('Momo', 'y', 3)]);
    expect(sel?.kind).toBe('chaos');
    expect(sel?.actorName).toBe('Momo');
  });

  it('prefers boon over chaos in the same round', () => {
    const sel = selectTeammateEvent(story, [roll('Kai', 'x', 17), roll('Mia', 'y', 1)]);
    expect(sel?.kind).toBe('boon');
  });

  it('returns null in the dead zone (7..14)', () => {
    expect(selectTeammateEvent(story, [roll('Kai', 'x', 10), roll('Mia', 'y', 12)])).toBeNull();
  });

  it('falls back to defaultRoleEvent for unknown members', () => {
    const sel = selectTeammateEvent(story, [roll('Zara', 'x', 18)]);
    expect(sel?.event.target).toBe(story.defaultRoleEvent.boon.target);
  });
});

describe('pickPivotalEvent', () => {
  const ev = (round: number, kind: 'boon' | 'chaos', actorName: string): LoggedEvent => ({
    round, kind, actorName, role: 'x', line: 'l', coda: 'c', fromNode: 'a', toNode: 'b',
  });

  it('returns null for an empty log', () => {
    expect(pickPivotalEvent([])).toBeNull();
  });

  it('prefers a boon over a chaos', () => {
    expect(pickPivotalEvent([ev(1, 'chaos', 'Mia'), ev(2, 'boon', 'Kai')])?.actorName).toBe('Kai');
  });

  it('among boons, the latest round wins', () => {
    expect(pickPivotalEvent([ev(1, 'boon', 'Kai'), ev(3, 'boon', 'Momo')])?.actorName).toBe('Momo');
  });

  it('falls back to the latest chaos when no boon', () => {
    expect(pickPivotalEvent([ev(1, 'chaos', 'Mia'), ev(2, 'chaos', 'Momo')])?.actorName).toBe('Momo');
  });
});

describe('advance event override', () => {
  const story = pickBranchingStory('group-chat-trial');

  it('returns the event target when an override is given (keeping roll-based success)', () => {
    const r = advance(story, 'open', 0, 14, 'kai_receipt');
    expect(r.nextId).toBe('kai_receipt');
    expect(r.success).toBe(true);
  });

  it('ignores the override when undefined (normal routing)', () => {
    const r = advance(story, 'open', 0, 14);
    expect(r.nextId).toBe('calm');
  });
});
