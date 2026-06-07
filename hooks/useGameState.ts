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

/** Minimum rounds before allowing the story to end — prevents abrupt endings. */
const MIN_ROUNDS_BEFORE_ENDING = 3;

// Put the human ("You") first so the table reads You-led.
const youFirst = <T extends { name: string }>(ps: T[]): T[] =>
  [...ps.filter((p) => p.name === 'You'), ...ps.filter((p) => p.name !== 'You')];

// One teammate reacts each turn — tuned to the roll so it's responsive, not
// random filler. One line, rotating member, so the group is present but not spammy.
const CHEER = [
  'okay that actually worked 👏',
  'carrying us fr',
  'no bc that was clean',
  'we move 🙌',
  'lowkey iconic',
  "see, this is why you're here",
];
const ROAST = [
  'this is going great 💀',
  'we are so cooked',
  'who let them cook',
  'not like this 😭',
  "i'm looking away",
  'bro had ONE job',
];

export type GamePhase = 'lobby' | 'loading' | 'theme' | 'playing' | 'ended';

export interface ActorResult {
  actorName: string;
  choiceIndex: number;
  choiceLabel: string;
  roll: number;
  label: string;
}

export interface GameMoment {
  round: number;
  actorName: string;
  action: string;
  roll: number;
  result: string;
}

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
  questCard: { title: string; caption: string; best_interference: string; final_roll: number; cta: string; epilogue?: string; highlight?: string } | null;
  shareUrl: string;

  /** Team turn system: index of the current actor in the players array */
  currentActorIndex: number;
  /** Results collected so far in this round (one entry per actor who has acted) */
  actorResults: ActorResult[];
  /** True when all actors have acted this round and we're waiting to advance the story */
  roundComplete: boolean;
  /** Memorable moments from the entire game journey (for Quest Card) */
  gameMoments: GameMoment[];
  /** Statistics for the Quest Card */
  gameStats: {
    totalRounds: number;
    highestRoll: { value: number; actor: string };
    lowestRoll: { value: number; actor: string };
    criticalSuccess: number; // 20s
    criticalFailure: number; // 1s
  } | null;
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
  currentActorIndex: 0,
  actorResults: [],
  roundComplete: false,
  gameMoments: [],
  gameStats: null,
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

  /** Story-themed universal actions for the grey "common" option group. */
  const commonActions = useCallback((): string[] => storyRef.current?.common ?? [], []);

  /** The current node's choices (label + emoji) for the protagonist. */
  const currentChoices = useCallback((): Array<{ label: string; emoji?: string }> => {
    const story = storyRef.current;
    if (!story) return [];
    const node = getNode(story, state.nodeId);
    if (!node) return [];
    return node.choices.map((c) => ({ label: c.label, emoji: c.emoji }));
  }, [state.nodeId]);

  /**
   * Resolve one actor's choice + roll: post the action + dice, store the result,
   * then either move to the next actor or advance the story if everyone has acted.
   */
  const resolveActorChoice = useCallback(async (index: number, roll: number) => {
    const story = storyRef.current;
    if (!story) return;

    const currentActor = state.players[state.currentActorIndex];
    if (!currentActor) return;

    const node = getNode(story, state.nodeId);
    if (!node) return;
    const i = Math.max(0, Math.min(index, node.choices.length - 1));
    const choice = node.choices[i];
    const d = toDiceRoll(roll);

    // 1) Record this actor's action + dice result
    const result: ActorResult = {
      actorName: currentActor.name,
      choiceIndex: i,
      choiceLabel: choice.label,
      roll: d.value,
      label: d.label,
    };

    // Record memorable moment for Quest Card
    const moment: GameMoment = {
      round: state.round,
      actorName: currentActor.name,
      action: choice.label,
      roll: d.value,
      result: d.label,
    };

    setState((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: nextId(),
          author: currentActor.name,
          avatar: currentActor.name,
          text: choice.label,
          kind: 'action' as const,
          dice: { value: d.value, label: d.label, color: d.color, emoji: d.emoji },
        },
      ],
      actorResults: [...s.actorResults, result],
      gameMoments: [...s.gameMoments, moment],
    }));

    // 2) Check if this was the last actor
    const isLastActor = state.currentActorIndex >= state.players.length - 1;

    if (isLastActor) {
      // All actors have acted — advance the story
      await delay(800);
      await advanceStoryWithTeamResults(story, result);
    } else {
      // Move to the next actor
      await delay(500);
      setState((s) => ({
        ...s,
        currentActorIndex: s.currentActorIndex + 1,
      }));
    }
  }, [state.currentActorIndex, state.players, state.nodeId, state.actorResults]);

  /**
   * After all actors have acted, aggregate their results and advance the story.
   */
  const advanceStoryWithTeamResults = useCallback(async (
    story: BranchingStory,
    lastResult: ActorResult,
  ) => {
    // For now, use the protagonist's ("You") choice to determine the branch
    // TODO: Implement more sophisticated team result aggregation
    const youResult = state.actorResults.find((r) => r.actorName === 'You') ?? lastResult;

    const node = getNode(story, state.nodeId);
    if (!node) return;

    const { nextId: nextNodeId } = advance(story, state.nodeId, youResult.choiceIndex, youResult.roll);

    await delay(300);
    setState((s) => ({ ...s, narratorTyping: true }));
    await delay(900);

    // Prevent abrupt endings by enforcing minimum rounds
    let finalNodeId = nextNodeId;
    if (isEnding(story, nextNodeId) && state.round < MIN_ROUNDS_BEFORE_ENDING) {
      finalNodeId = `bridge_${nextNodeId}`;
    }

    if (isEnding(story, finalNodeId)) {
      const ending = getEnding(story, finalNodeId)!;

      // Calculate game statistics for Quest Card
      const stats = {
        totalRounds: state.round,
        highestRoll: state.gameMoments.reduce((max, m) => m.roll > max.value ? { value: m.roll, actor: m.actorName } : max, { value: 0, actor: '' }),
        lowestRoll: state.gameMoments.reduce((min, m) => m.roll < min.value ? { value: m.roll, actor: m.actorName } : min, { value: 20, actor: '' }),
        criticalSuccess: state.gameMoments.filter(m => m.roll === 20).length,
        criticalFailure: state.gameMoments.filter(m => m.roll === 1).length,
      };

      // Generate dynamic Quest Card content based on game journey
      const journeyHighlights = state.gameMoments
        .filter(m => m.roll >= 18 || m.roll <= 3)
        .slice(-3)
        .map(m => `${m.actorName} rolled ${m.roll}: "${m.action.slice(0, 30)}..."`)
        .join(' • ');

      const bestPerformer = state.gameMoments
        .reduce((acc, m) => {
          const actorTotal = state.gameMoments.filter(x => x.actorName === m.actorName).reduce((sum, x) => sum + x.roll, 0);
          const maxTotal = Math.max(...Object.values(acc));
          return actorTotal > maxTotal ? { ...acc, [m.actorName]: actorTotal } : acc;
        }, {} as Record<string, number>);

      const mvpName = Object.keys(bestPerformer)[0] || 'You';
      const mvpScore = bestPerformer[mvpName] || 0;

      // The single most dramatic beat — featured on the ending card.
      const crit = state.gameMoments.find((m) => m.roll === 20);
      const topMoment = state.gameMoments.reduce<(typeof state.gameMoments)[number] | null>((b, m) => (b && b.roll >= m.roll ? b : m), null);
      const flop = state.gameMoments.find((m) => m.roll === 1);
      const pick = crit ?? topMoment ?? flop ?? null;
      const highlight = !pick
        ? ''
        : pick.roll === 20
          ? `🔥 ${pick.actorName} landed a natural 20 — “${pick.action}”`
          : pick.roll === 1
            ? `💀 ${pick.actorName} rolled a 1 — “${pick.action}”`
            : `⭐ ${pick.actorName}'s boldest move — “${pick.action}” (D20 ${pick.roll})`;

      setState((s) => ({
        ...s,
        narratorTyping: false,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: ending.scene, kind: 'narration' as const }],
        lastRoll: { roll: youResult.roll, label: youResult.label },
        round: s.round + 1,
        currentActorIndex: 0,
        actorResults: [],
        roundComplete: true,
        gameStats: stats,
      }));
      await delay(1100);
      setState((s) => ({
        ...s,
        questCard: {
          title: ending.title,
          caption: ending.caption,
          epilogue: ending.scene,
          highlight: highlight || journeyHighlights,
          best_interference: `MVP: ${mvpName} (${mvpScore} total) • ${stats.criticalSuccess} nat20s • ${stats.criticalFailure} nat1s`,
          final_roll: youResult.roll,
          cta: story.cta,
        },
        phase: 'ended',
      }));
    } else {
      const next = getNode(story, finalNodeId);
      setState((s) => ({
        ...s,
        narratorTyping: false,
        nodeId: finalNodeId,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: next?.scene ?? '…', kind: 'narration' as const }],
        lastRoll: { roll: youResult.roll, label: youResult.label },
        round: s.round + 1,
        currentActorIndex: 0,
        actorResults: [],
        roundComplete: false,
      }));
    }
  }, [state.nodeId, state.actorResults, state.round]);

  const resetGame = useCallback(() => {
    storyRef.current = null;
    setState(initialState);
  }, []);

  /** Get the current actor whose turn it is */
  const currentActor = useCallback(() => {
    return state.players[state.currentActorIndex];
  }, [state.players, state.currentActorIndex]);

  /** Get the current story reference */
  const getStoryRef = useCallback(() => {
    return storyRef.current;
  }, []);

  /** Start a new round (reset actor index and results) */
  const startNewRound = useCallback(() => {
    setState((s) => ({
      ...s,
      currentActorIndex: 0,
      actorResults: [],
      roundComplete: false,
    }));
  }, []);

  /** Free-text chat from "You" — shows as your bubble, does NOT advance the story. */
  const sendChat = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setState((s) => ({
      ...s,
      messages: [...s.messages, { id: nextId(), author: 'You', avatar: '🎲', text: t, kind: 'action' as const }],
    }));
  }, []);

  return {
    state,
    testMode,
    setTestMode,
    setPhase,
    startQuest,
    currentChoices,
    commonActions,
    resolveActorChoice,
    resetGame,
    currentActor,
    getStoryRef,
    startNewRound,
    sendChat,
  };
}
