/**
 * useGameState.ts — Roll Call 简化状态机
 * 连接到 GLM API，适配当前项目的后端
 */
import { useState, useCallback, useRef } from 'react';
import { toDiceRoll } from '@/lib/dice';
import {
  pickTestStory,
  testQuestPlayers,
  testActions,
  testNarration,
  testReactions,
  testQuestCard,
} from '@/lib/testEngine';
import type { TestStory } from '@/data/testStories';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Local, instant NPC resolution — no LLM call. The NPC "pretends" to have AI
// but actually resolves its turn client-side so the loop never stalls.
const LOCAL_NARR: Record<string, string> = {
  'Critical Fail': 'Catastrophic miss — everything spirals into glorious nonsense.',
  'Fail': 'It flops, but in the funniest possible way; the mess only grows.',
  'Partial Progress': 'They scrape forward, but leave a fresh problem behind.',
  'Success': 'It works — a new clue surfaces and the scene shifts.',
  'Strong Success': 'A strong move — they gain an edge that rattles everyone else.',
  'Critical Success': 'Critical hit — a highlight moment, the whole group benefits.',
};
const LOCAL_REACTS = [
  'wait that actually worked?',
  'knew this would happen…',
  'who told you to do that lol',
  "i'm crying this is too much",
  'ok hold up we got this',
  'no way 😭',
];

export type GamePhase =
  | 'lobby'      // 冷群提示
  | 'loading'    // API 调用中
  | 'theme'      // 主题选择
  | 'playing'    // 游戏中
  | 'ended';     // 结束

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
  // True while the DM/narrator "is typing…" — drives the typing indicator.
  narratorTyping: boolean;
  // False until the prologue finishes streaming, so NPC turns don't jump the intro.
  ready: boolean;
  round: number;
  lastRoll: { roll: number; label: string; advantage?: boolean } | null;
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
  round: 0,
  lastRoll: null,
  fateCards: [],
  questCard: null,
  shareUrl: '',
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  // Test Mode (保底方案): run the whole game off a pre-written drama script —
  // zero network, zero LLM, instant — so a demo never stalls on a slow model.
  // Defaults ON: the demo should be instant out of the box; toggle off for live GLM.
  const [testMode, setTestMode] = useState(true);
  const storyRef = useRef<TestStory | null>(null);
  const idRef = useRef(0);
  const recentRef = useRef('');

  const nextId = () => `m${idRef.current++}`;

  const setPhase = useCallback((phase: GamePhase) => {
    setState(s => ({ ...s, phase }));
  }, []);

  const startQuest = useCallback(async (members: string[], theme: string) => {
    setPhase('loading');
    try {
      const questId = `q_${Date.now()}`;

      // Test Mode: build the quest from a local script, no /api/quest call.
      if (testMode) {
        const story = pickTestStory(theme, Date.now());
        storyRef.current = story;
        const players = testQuestPlayers(story, members);
        setState({
          ...initialState,
          phase: 'playing',
          questId,
          theme,
          players,
          messages: [],
          round: 0,
          shareUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${questId}`,
        });
        for (const line of story.prologue) {
          setState(s => ({ ...s, narratorTyping: true }));
          await delay(700);
          setState(s => ({
            ...s,
            narratorTyping: false,
            messages: [...s.messages, { id: nextId(), author: 'Narrator', avatar: '🎬', text: line, kind: 'narration' }],
          }));
          recentRef.current = line;
          await delay(200);
        }
        setState(s => ({ ...s, ready: true }));
        return;
      }

      const res = await fetch('/api/quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, members, theme }),
      });
      const quest = await res.json();

      setState({
        ...initialState,
        phase: 'playing',
        questId,
        theme,
        players: quest.players,
        messages: [],
        round: 0,
        shareUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${questId}`,
      });

      // 逐行显示 prologue（每行前先让旁白"打字"一会儿）
      const lines = quest.prologue?.length ? quest.prologue : [quest.scene.setup];
      for (const line of lines) {
        setState(s => ({ ...s, narratorTyping: true }));
        await delay(750);
        setState(s => ({
          ...s,
          narratorTyping: false,
          messages: [...s.messages, { id: nextId(), author: 'Narrator', avatar: '🎬', text: line, kind: 'narration' }],
        }));
        recentRef.current = line;
        await delay(250);
      }
      // Intro finished — NPC turns may now begin.
      setState(s => ({ ...s, ready: true }));
    } catch {
      setPhase('lobby');
    }
  }, [setPhase, testMode]);

  const fetchActions = useCallback(async (activePlayer: { name: string; role: string }, roundIdx: number) => {
    const fallback = ['Search the area', 'Use your ability', 'Take a bold move'];
    if (testMode && storyRef.current) {
      return testActions(storyRef.current, roundIdx);
    }
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: state.questId,
          recent: recentRef.current || 'The quest begins.',
          active: activePlayer, // route expects `active`, not `activePlayer`
          seed: roundIdx,
        }),
      });
      if (!res.ok) return fallback;
      const data = await res.json();
      return Array.isArray(data.options) && data.options.length ? data.options : fallback;
    } catch {
      return fallback;
    }
  }, [state.questId, testMode]);

  const doRoll = useCallback(async (roll: number, activePlayer: { name: string; role: string }, action: string) => {
    let narration = 'The story pushes on...';
    let reactions: Array<{ member: string; text: string }> = [];
    let finalRoll = roll;
    let finalLabel = '';

    if (testMode && storyRef.current) {
      // Fully scripted: no /api/fate or /api/roll calls — instant and offline.
      const story = storyRef.current;
      const reactors = state.players.filter(p => p.name !== activePlayer.name).slice(0, 2);
      narration = testNarration(story, state.round, roll);
      reactions = testReactions(story, reactors, state.round);
    } else {
      // 拉取 Fate Cards（本地 store，廉价）
      try {
        const f = await fetch(`/api/fate?questId=${state.questId}`);
        if (f.ok) {
          const data = await f.json();
          if (Array.isArray(data.cards)) setState(s => ({ ...s, fateCards: data.cards }));
        }
      } catch {}

      // 先拿 GLM 结果（叙述 + 反应），失败则兜底文案。
      try {
        const res = await fetch('/api/roll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questId: state.questId, roll, recent: recentRef.current, round: state.round, active: activePlayer, action }),
        });
        const result = await res.json();
        if (result.narration) narration = result.narration;
        if (Array.isArray(result.reactions)) reactions = result.reactions;
        if (typeof result.roll === 'number') finalRoll = result.roll;
        if (typeof result.label === 'string') finalLabel = result.label;
      } catch {}
    }

    const d = toDiceRoll(finalRoll);
    const label = finalLabel || d.label;

    // 1) 行动气泡（内联骰子结果）
    setState(s => ({
      ...s,
      messages: [...s.messages, { id: nextId(), author: activePlayer.name, avatar: '🎲', text: action, kind: 'action' as const, dice: { value: d.value, label, color: d.color, emoji: d.emoji } }],
    }));
    // 2) 其他成员错峰吐槽
    for (let i = 0; i < reactions.length; i++) {
      await delay(450);
      const r = reactions[i];
      setState(s => ({
        ...s,
        messages: [...s.messages, { id: nextId(), author: r.member, avatar: r.member, text: r.text, kind: 'member' as const }],
      }));
    }
    // 3) 旁白"正在输入" → 旁白
    await delay(300);
    setState(s => ({ ...s, narratorTyping: true }));
    await delay(900);
    setState(s => ({
      ...s,
      narratorTyping: false,
      messages: [...s.messages, { id: nextId(), author: 'Narrator', avatar: '🎬', text: narration, kind: 'narration' as const }],
      lastRoll: { roll: d.value, label },
      round: s.round + 1,
    }));
    recentRef.current = narration;
  }, [state.questId, state.round, state.players, testMode]);

  // Local NPC turn resolution — no network / no LLM, but same cinematic pacing.
  const doRollLocal = useCallback(async (roll: number, activePlayer: { name: string; role: string }, action: string) => {
    const d = toDiceRoll(roll);
    // In Test Mode, NPC turns pull scripted narration too, so the whole story
    // reads as one written drama instead of generic filler lines.
    const narration = (testMode && storyRef.current)
      ? testNarration(storyRef.current, state.round, roll)
      : LOCAL_NARR[d.label] ?? 'The story rolls on…';

    // 1) 行动气泡（内联骰子结果）
    setState(s => ({
      ...s,
      messages: [...s.messages, { id: nextId(), author: activePlayer.name, avatar: '🎲', text: action, kind: 'action' as const, dice: { value: d.value, label: d.label, color: d.color, emoji: d.emoji } }],
    }));
    // 2) 其他成员错峰吐槽
    const reactors = state.players.filter(p => p.name !== activePlayer.name).slice(0, 2);
    const scripted = (testMode && storyRef.current) ? testReactions(storyRef.current, reactors, state.round) : null;
    for (let i = 0; i < reactors.length; i++) {
      await delay(450);
      const p = reactors[i];
      const text = scripted ? scripted[i].text : LOCAL_REACTS[(roll + i) % LOCAL_REACTS.length];
      setState(s => ({
        ...s,
        messages: [...s.messages, { id: nextId(), author: p.name, avatar: p.name, text, kind: 'member' as const }],
      }));
    }
    // 3) 旁白"正在输入" → 旁白
    await delay(300);
    setState(s => ({ ...s, narratorTyping: true }));
    await delay(900);
    setState(s => ({
      ...s,
      narratorTyping: false,
      messages: [...s.messages, { id: nextId(), author: 'Narrator', avatar: '🎬', text: narration, kind: 'narration' as const }],
      lastRoll: { roll: d.value, label: d.label },
      round: s.round + 1,
    }));
    recentRef.current = narration;
  }, [state.players, state.round, testMode]);

  const finishQuest = useCallback(async (finalRoll: number) => {
    if (testMode && storyRef.current) {
      const card = testQuestCard(storyRef.current, finalRoll, recentRef.current);
      setState(s => ({ ...s, questCard: card, phase: 'ended' }));
      return;
    }
    try {
      const res = await fetch('/api/questcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: state.questId,
          finalRoll,
          summary: recentRef.current,
        }),
      });
      const card = await res.json();
      setState(s => ({ ...s, questCard: card, phase: 'ended' }));
    } catch {
      setPhase('ended');
    }
  }, [state.questId, setPhase, testMode]);

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
    fetchActions,
    doRoll,
    doRollLocal,
    finishQuest,
    resetGame,
  };
}