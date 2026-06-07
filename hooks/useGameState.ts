/**
 * useGameState.ts — Roll Call state machine (branching story model).
 *
 * The human ("You") is the protagonist and drives a branching story TREE: every
 * beat is a node with a cohesive scene + 2 choices. You pick, roll a D20, and
 * success/failure routes to a different next node — so the story is long,
 * connected, and ends on a real ending node (not an abrupt round cap). AI
 * members are flavour (reactions), they don't take turns.
 *
 * Fully scripted + offline (zero LLM), so a demo never stalls. See
 * data/branchingStories.ts and lib/branchingEngine.ts.
 */
import { useState, useCallback, useRef } from 'react';
import { toDiceRoll } from '@/lib/dice';
import {
  pickBranchingStory,
  branchPlayers,
  branchDetail,
  getNode,
  getEnding,
  isEnding,
  advance,
} from '@/lib/branchingEngine';
import type { BranchingStory } from '@/data/branchingStories';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Put the human ("You") first so the table reads You-led.
const youFirst = <T extends { name: string }>(ps: T[]): T[] =>
  [...ps.filter((p) => p.name === 'You'), ...ps.filter((p) => p.name !== 'You')];

export type GamePhase = 'lobby' | 'loading' | 'theme' | 'playing' | 'ended';

export interface GameState {
  phase: GamePhase;
  questId: string;
  theme: string | null;
  players: Array<{ name: string; role: string; ability: string; status: string }>;
  messages: Array<{
    id: string;
    author: string;
    avatar: string;
    text: string;
    kind: 'narration' | 'member' | 'action';
    dice?: { value: number; label: string; color: string; emoji: string };
  }>;
  /** True while the DM "is typing…" — drives the typing indicator. */
  narratorTyping: boolean;
  /** False until the intro finishes streaming, so choices don't show early. */
  ready: boolean;
  /** Current story-tree node id. */
  nodeId: string;
  /** Beats resolved so far (step counter). */
  round: number;
  lastRoll: { roll: number; label: string } | null;
  fateCards: Array<{ type: string; title: string; effect: string }>;
  questCard: { title: string; caption: string; best_interference: string; final_roll: number; cta: string } | null;
  shareUrl: string;
}

const initialState: GameState = {
  phase: 'lobby',
  questId: '',
  theme: null,
  players: [],
  messages: [],
  narratorTyping: false,
  ready: false,
  nodeId: '',
  round: 0,
  lastRoll: null,
  fateCards: [],
  questCard: null,
  shareUrl: '',
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  // Kept for the LobbyScreen toggle; the game is always scripted/instant now.
  const [testMode, setTestMode] = useState(true);
  const storyRef = useRef<BranchingStory | null>(null);
  const idRef = useRef(0);
  const nextId = () => `m${idRef.current++}`;

  const setPhase = useCallback((phase: GamePhase) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  const startQuest = useCallback(async (members: string[], theme: string) => {
    setPhase('loading');
    const questId = `q_${Date.now()}`;
    const story = pickBranchingStory(theme, Date.now());
    storyRef.current = story;
    const players = youFirst(branchPlayers(story, members));

    setState({
      ...initialState,
      phase: 'playing',
      questId,
      theme: story.theme,
      players,
      nodeId: story.start,
      shareUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${questId}`,
    });

    // A single DM chat bubble, typed out (avatar/name styled by PlayingScreen).
    const dmSay = async (text: string, typingMs = 650) => {
      setState((s) => ({ ...s, narratorTyping: true }));
      await delay(typingMs);
      setState((s) => ({
        ...s,
        narratorTyping: false,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text, kind: 'narration' as const }],
      }));
      await delay(170);
    };

    // Opening: one cohesive intro block, then DM assigns each role in a bubble.
    await dmSay(story.intro, 800);
    for (const p of players) {
      await dmSay(`🎭 @${p.name} — ${p.role}. ${branchDetail(story, p.name)}`, 450);
    }
    // First scene of the tree.
    const first = getNode(story, story.start);
    if (first) await dmSay(first.scene, 750);
    setState((s) => ({ ...s, ready: true }));
  }, [setPhase]);

  /** The current node's choices (label + emoji) for the protagonist. */
  const currentChoices = useCallback((): Array<{ label: string; emoji?: string }> => {
    const story = storyRef.current;
    if (!story) return [];
    const node = getNode(story, state.nodeId);
    if (!node) return [];
    return node.choices.map((c) => ({ label: c.label, emoji: c.emoji }));
  }, [state.nodeId]);

  /**
   * Resolve the protagonist's choice + roll: post the action + dice, a couple
   * of AI-member reactions, then route to the next node (or the ending).
   */
  const resolveChoice = useCallback(async (index: number, roll: number) => {
    const story = storyRef.current;
    if (!story) return;
    const node = getNode(story, state.nodeId);
    if (!node) return;
    const i = Math.max(0, Math.min(index, node.choices.length - 1));
    const choice = node.choices[i];
    const d = toDiceRoll(roll);

    // 1) Your action bubble with the inline dice result.
    setState((s) => ({
      ...s,
      messages: [...s.messages, { id: nextId(), author: 'You', avatar: '🎲', text: choice.label, kind: 'action' as const, dice: { value: d.value, label: d.label, color: d.color, emoji: d.emoji } }],
    }));

    // (No per-turn member chatter — it read as fragmented, repetitive filler.
    //  The group is represented by the player cards instead.)

    // 2) DM "types", then narrates the next scene (or the ending).
    const { nextId: nextNodeId } = advance(story, state.nodeId, i, roll);
    await delay(300);
    setState((s) => ({ ...s, narratorTyping: true }));
    await delay(900);

    if (isEnding(story, nextNodeId)) {
      const ending = getEnding(story, nextNodeId)!;
      setState((s) => ({
        ...s,
        narratorTyping: false,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: ending.scene, kind: 'narration' as const }],
        lastRoll: { roll: d.value, label: d.label },
        round: s.round + 1,
      }));
      await delay(1100);
      setState((s) => ({
        ...s,
        questCard: { title: ending.title, caption: ending.caption, best_interference: '—', final_roll: d.value, cta: story.cta },
        phase: 'ended',
      }));
    } else {
      const next = getNode(story, nextNodeId);
      setState((s) => ({
        ...s,
        narratorTyping: false,
        nodeId: nextNodeId,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: next?.scene ?? '…', kind: 'narration' as const }],
        lastRoll: { roll: d.value, label: d.label },
        round: s.round + 1,
      }));
    }
  }, [state.nodeId, state.players, state.round]);

  const resetGame = useCallback(() => {
    storyRef.current = null;
    setState(initialState);
  }, []);

  return {
    state,
    testMode,
    setTestMode,
    setPhase,
    startQuest,
    currentChoices,
    resolveChoice,
    resetGame,
  };
}
