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
  selectTeammateEvent,
  pickPivotalEvent,
} from '@/lib/branchingEngine';
import type { LoggedEvent } from '@/lib/branchingEngine';
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

/** One DM line that makes You's choice + roll legible before the next scene. */
function causalBridge(
  choiceLabel: string,
  roll: number,
  swing?: { actorName: string; kind: 'boon' | 'chaos' },
): string {
  const landed = roll >= 11 ? 'and it lands' : 'and it slips';
  let line = `You went with "${choiceLabel}" (${roll}) — ${landed}.`;
  if (swing) line += ` Then ${swing.actorName} ${swing.kind === 'boon' ? 'swings it your way' : 'sends it sideways'}.`;
  return line;
}

/** Ending card shows at most two turning points: the pivotal event first, then the
 *  next most-recent distinct one. Dedupes repeated event lines so reruns of the
 *  same teammate beat don't flood the card. */
function topEvents(
  log: LoggedEvent[],
): Array<{ actorName: string; role: string; kind: 'boon' | 'chaos'; line: string }> {
  const pivotal = pickPivotalEvent(log);
  const seen = new Set<string>();
  const out: LoggedEvent[] = [];
  if (pivotal) { out.push(pivotal); seen.add(pivotal.line); }
  for (const e of [...log].reverse()) {
    if (out.length >= 2) break;
    if (seen.has(e.line)) continue;
    seen.add(e.line);
    out.push(e);
  }
  return out.slice(0, 2).map((e) => ({ actorName: e.actorName, role: e.role, kind: e.kind, line: e.line }));
}

const clampTension = (n: number) => Math.max(0, Math.min(100, n));

/**
 * D20 tier → how it swings the doom clock + whether it leaves a mark.
 * Crit success calms the room a lot; partials (6–10) succeed-at-a-cost and add
 * tension; crit fail spikes it and scars you.
 */
function tierEffect(roll: number): { delta: number; mark: '' | 'boon' | 'scar' } {
  const v = Math.max(1, Math.min(20, Math.floor(roll)));
  if (v === 20) return { delta: -14, mark: 'boon' };
  if (v >= 16) return { delta: -8, mark: '' };
  if (v >= 11) return { delta: -5, mark: '' };
  if (v >= 6) return { delta: 7, mark: '' };   // partial — at a cost
  if (v >= 2) return { delta: 11, mark: '' };
  return { delta: 16, mark: 'scar' };          // nat 1
}

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
  questCard: { title: string; caption: string; best_interference: string; final_roll: number; cta: string; epilogue?: string; highlight?: string; marks?: Array<{ kind: 'boon' | 'scar'; text: string }>; tone?: 'win' | 'mixed' | 'down'; theme?: string; events?: Array<{ actorName: string; role: string; kind: 'boon' | 'chaos'; line: string }>; pivotal?: { actorName: string; kind: 'boon' | 'chaos'; coda: string } | null } | null;
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

  /** DnD layer: doom clock 0–100 (failure raises it; 100 = bad ending). */
  tension: number;
  /** Teammate "ask for help" tokens — each grants one advantage roll. */
  helpTokens: number;
  /** Earned marks: nat-20 boons and nat-1 scars, shown on the ending card. */
  marks: Array<{ kind: 'boon' | 'scar'; text: string }>;

  /** Teammate events that fired this run (for the ending card recap). */
  eventLog: LoggedEvent[];
  /** Last meaningful tension change (from You's action), for meter microcopy. */
  lastTensionDelta: number;
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
  tension: 35,
  helpTokens: 2,
  marks: [],
  eventLog: [],
  lastTensionDelta: 0,
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
  const resolveActorChoice = useCallback(async (index: number, roll: number, actionLabel?: string) => {
    const story = storyRef.current;
    if (!story) return;

    const currentActor = state.players[state.currentActorIndex];
    if (!currentActor) return;

    const node = getNode(story, state.nodeId);
    if (!node) return;
    const i = Math.max(0, Math.min(index, node.choices.length - 1));
    const choice = node.choices[i];
    const d = toDiceRoll(roll);
    const isYou = currentActor.name === 'You';
    // NPCs don't reuse the protagonist's branch options (that reads weird) —
    // they get a short, role-flavored side-action passed in as actionLabel.
    const shownLabel = !isYou && actionLabel ? actionLabel : choice.label;

    // DnD layer: tier swings the doom clock (You full weight, NPCs ~⅓), and a
    // nat-20 / nat-1 on YOUR roll leaves a boon / scar.
    const eff = tierEffect(d.value);
    const tDelta = Math.round(eff.delta * (isYou ? 1 : 0.35));
    const willTension = clampTension(state.tension + tDelta);
    const newMark = isYou && eff.mark
      ? { kind: eff.mark, text: eff.mark === 'boon' ? `🔥 ${choice.label} — nailed it (nat 20)` : `💀 ${choice.label} — backfired (nat 1)` }
      : null;

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
      action: shownLabel,
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
          text: shownLabel,
          kind: 'action' as const,
          dice: { value: d.value, label: d.label, color: d.color, emoji: d.emoji },
        },
      ],
      actorResults: [...s.actorResults, result],
      gameMoments: [...s.gameMoments, moment],
      tension: clampTension(s.tension + tDelta),
      lastTensionDelta: isYou ? tDelta : s.lastTensionDelta,
      marks: newMark ? [...s.marks, newMark] : s.marks,
    }));

    // Doom clock maxed → the run collapses into a bad ending right here.
    if (willTension >= 100) {
      await delay(900);
      setState((s) => ({ ...s, narratorTyping: true }));
      await delay(900);
      const epi = 'The tension boiled over before anyone could pull it back — the group scattered, and the moment was lost for good.';
      setState((s) => ({
        ...s,
        narratorTyping: false,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: epi, kind: 'narration' as const }],
      }));
      await delay(1000);
      setState((s) => ({
        ...s,
        questCard: { title: 'It All Fell Apart', caption: 'too much chaos, too fast', epilogue: epi, highlight: '', best_interference: '', final_roll: d.value, cta: story.cta, marks: s.marks, tone: 'down', theme: story.theme, events: s.eventLog.map((e) => ({ actorName: e.actorName, role: e.role, kind: e.kind, line: e.line })), pivotal: (() => { const p = pickPivotalEvent(s.eventLog); return p ? { actorName: p.actorName, kind: p.kind, coda: p.coda } : null; })() },
        phase: 'ended',
      }));
      return;
    }

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
    // You's choice sets the baseline branch; a teammate event can reroute it.
    const youResult = state.actorResults.find((r) => r.actorName === 'You') ?? lastResult;

    const node = getNode(story, state.nodeId);
    if (!node) return;

    // Teammate (non-You) rolls → pick at most one event for the round.
    const roleOf = (name: string) => state.players.find((p) => p.name === name)?.role ?? name;
    const teammateRolls = state.actorResults
      .filter((r) => r.actorName !== 'You')
      .map((r) => ({ name: r.actorName, role: roleOf(r.actorName), roll: r.roll }));
    const selected = selectTeammateEvent(story, teammateRolls);

    const { nextId: nextNodeId } = advance(
      story,
      state.nodeId,
      youResult.choiceIndex,
      youResult.roll,
      selected?.event.target,
    );

    await delay(300);
    setState((s) => ({ ...s, narratorTyping: true }));
    await delay(900);

    // Causal bridge — every turn — then the event line if one fired.
    const bridge = causalBridge(
      youResult.choiceLabel,
      youResult.roll,
      selected ? { actorName: selected.actorName, kind: selected.kind } : undefined,
    );
    setState((s) => ({
      ...s,
      messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: bridge, kind: 'narration' as const }],
    }));
    let loggedEvents = state.eventLog;
    if (selected) {
      const entry: LoggedEvent = {
        round: state.round,
        actorName: selected.actorName,
        role: selected.role,
        kind: selected.kind,
        line: selected.event.line,
        coda: selected.event.coda,
        fromNode: state.nodeId,
        toNode: selected.event.target,
      };
      loggedEvents = [...state.eventLog, entry];
      await delay(250);
      setState((s) => ({
        ...s,
        eventLog: loggedEvents,
        messages: [...s.messages, { id: nextId(), author: 'DM', avatar: '🎬', text: selected.event.line, kind: 'narration' as const }],
      }));
      await delay(250);
    }

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
        questCard: (() => {
          const pivotal = pickPivotalEvent(loggedEvents);
          const epilogue = pivotal ? `${ending.scene} ${pivotal.coda}` : ending.scene;
          return {
            title: ending.title,
            caption: ending.caption,
            epilogue,
            highlight: highlight || journeyHighlights,
            best_interference: `${pivotal ? `Swung by ${pivotal.actorName} • ` : ''}MVP: ${mvpName} (${mvpScore} total) • ${stats.criticalSuccess} nat20s • ${stats.criticalFailure} nat1s`,
            final_roll: youResult.roll,
            cta: story.cta,
            marks: s.marks,
            tone: ending.tone,
            theme: story.theme,
            events: loggedEvents.map((e) => ({ actorName: e.actorName, role: e.role, kind: e.kind, line: e.line })),
            pivotal: pivotal ? { actorName: pivotal.actorName, kind: pivotal.kind, coda: pivotal.coda } : null,
          };
        })(),
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
  }, [state.nodeId, state.actorResults, state.round, state.players, state.eventLog]);

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

  /** Spend a help token: a teammate jumps in (chat line) and you get advantage. */
  const spendHelp = useCallback((): boolean => {
    if (state.helpTokens <= 0) return false;
    const others = state.players.filter((p) => p.name !== 'You');
    const helper = others.length ? others[(others.length - state.helpTokens + others.length) % others.length] : null;
    setState((s) => ({
      ...s,
      helpTokens: Math.max(0, s.helpTokens - 1),
      messages: helper
        ? [...s.messages, { id: nextId(), author: helper.name, avatar: helper.name, text: 'jumps in to help — advantage! 🤝', kind: 'member' as const }]
        : s.messages,
    }));
    return true;
  }, [state.helpTokens, state.players]);

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
    spendHelp,
  };
}
