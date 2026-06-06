/**
 * PlayingScreen — 游戏进行中
 *
 * Group-chat feel borrowed from the vibe-dice reference: a DM "typing…"
 * indicator, an animated D20 roll, staggered spring-in messages, dice results
 * inlined into the action bubble, per-player accent colors, and a per-storyline
 * DM persona. Colors come from CSS theme tokens so it works in light AND dark.
 */
import { useEffect, useRef, useState } from 'react';
import type { useGameState } from '@/hooks/useGameState';
import {
  toDiceRoll,
  rollNPCValue,
  rollPlayerValue,
  shouldEndQuest,
  type DiceRoll,
} from '@/lib/dice';
import { accentFor, dmFor, type DM } from '@/lib/theme';

type GameHook = ReturnType<typeof useGameState>;

// Generic moves NPCs randomly pick from — no LLM call, instant.
const NPC_ACTION_POOL = [
  'Search the area',
  'Use your ability',
  'Take a bold move',
  'Investigate the strange sound',
  'Back up a teammate',
  'Improvise something risky',
];

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Animated D20 die ──────────────────────────────────────────────────────
function D20Dice({ wobbling, dice }: { wobbling: boolean; dice: DiceRoll }) {
  return (
    <div className="flex flex-col items-center gap-2 my-1">
      <div
        className={`flex items-center justify-center ${wobbling ? 'dice-rolling' : ''}`}
        style={{ width: 72, height: 72 }}
      >
        <svg width="72" height="72" viewBox="0 0 80 80">
          <polygon points="40,4 76,62 4,62" fill={wobbling ? '#1DB954' : dice.color} stroke="#fff" strokeWidth="2" opacity="0.95" />
          <polygon points="40,76 76,62 4,62" fill={wobbling ? '#17a347' : dice.color} stroke="#fff" strokeWidth="2" opacity="0.65" />
          <text x="40" y="48" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">
            {wobbling ? '?' : dice.value}
          </text>
        </svg>
      </div>
      {!wobbling && (
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: dice.color }}>
          {dice.emoji} {dice.label}
        </div>
      )}
    </div>
  );
}

// ─── DM "typing…" bubble ───────────────────────────────────────────────────
function TypingIndicator({ dm }: { dm: DM }) {
  return (
    <div className="flex items-end gap-2 bubble-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--zymix-fate-light)' }}>
        {dm.avatar}
      </div>
      <div className="bubble-received flex items-center gap-1.5" style={{ paddingTop: 13, paddingBottom: 13 }}>
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
        <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

export default function PlayingScreen({ game }: { game: GameHook }) {
  const { state, fetchActions, doRoll, doRollLocal, finishQuest } = game;
  const [beatPhase, setBeatPhase] = useState<'action' | 'rolling' | 'narrating'>('action');
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [rolls, setRolls] = useState<number[]>([]);
  const [dice, setDice] = useState<DiceRoll | null>(null);
  const [diceWobbling, setDiceWobbling] = useState(false);
  const [showBigDice, setShowBigDice] = useState(false);

  const endingRef = useRef(false);
  const lastRoundRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const activePlayer = state.players[state.round % state.players.length];
  const isHuman = activePlayer?.name === 'You';
  // The storyteller persona for this run's theme (different DM per storyline).
  const dm = dmFor(state.theme);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length, state.narratorTyping, diceWobbling, beatPhase]);

  useEffect(() => {
    if (!state.ready || state.phase !== 'playing' || !activePlayer || !isHuman) return;
    if (beatPhase !== 'action') return;
    fetchActions(activePlayer, state.round).then(setActionOptions);
  }, [state.ready, state.phase, state.round, activePlayer, isHuman, beatPhase, fetchActions]);

  const handleChooseAction = (action: string) => {
    setSelectedAction(action);
    setBeatPhase('rolling');
  };

  // NPC auto-play — pick a random local move (no LLM, ~1s pacing).
  useEffect(() => {
    if (!state.ready || state.phase !== 'playing' || !activePlayer || isHuman) return;
    if (beatPhase !== 'action') return;
    const choice = NPC_ACTION_POOL[Math.floor(Math.random() * NPC_ACTION_POOL.length)];
    const t = setTimeout(() => handleChooseAction(choice), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready, state.phase, activePlayer, isHuman, beatPhase, state.round]);

  // The roll → resolve sequence, shared by human and NPC.
  const performRoll = async (rawRoll: number) => {
    if (!selectedAction || !activePlayer) return;
    const d = toDiceRoll(rawRoll);

    setDice(d);
    setDiceWobbling(true);
    setShowBigDice(true);
    setBeatPhase('narrating');
    await delay(1100);
    setDiceWobbling(false);
    await delay(750);
    setShowBigDice(false);

    const nextRolls = [...rolls, d.value];
    setRolls(nextRolls);
    const completedRounds = state.round + 1;
    const willEnd = shouldEndQuest(completedRounds, state.players.length, nextRolls);
    if (willEnd) endingRef.current = true;

    if (isHuman) await doRoll(d.value, activePlayer, selectedAction);
    else await doRollLocal(d.value, activePlayer, selectedAction);

    if (willEnd) {
      await finishQuest(d.value);
    }
  };

  // NPC auto-play — roll automatically once an action is selected.
  useEffect(() => {
    if (!state.ready || state.phase !== 'playing' || !activePlayer || isHuman) return;
    if (beatPhase !== 'rolling' || !selectedAction) return;
    const t = setTimeout(() => performRoll(rollNPCValue()), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready, state.phase, activePlayer, isHuman, beatPhase, selectedAction]);

  // When the hook advances the round (narration revealed), open the next turn.
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.round === lastRoundRef.current) return;
    lastRoundRef.current = state.round;
    if (state.round === 0 || endingRef.current) return;
    const t = setTimeout(() => {
      setDice(null);
      setSelectedAction(null);
      setActionOptions([]);
      setBeatPhase('action');
    }, 1300);
    return () => clearTimeout(t);
  }, [state.round, state.phase]);

  const footerStyle = { background: 'var(--zymix-surface)', borderTop: '1px solid var(--zymix-border)' };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Player cards — each tinted with its owner's accent color */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {state.players.map((p, i) => {
          const accent = accentFor(p.name, state.players);
          const active = activePlayer?.name === p.name;
          return (
            <div
              key={p.name}
              className="role-card flex-shrink-0 bubble-in"
              style={{
                animationDelay: `${i * 60}ms`,
                background: active ? 'var(--zymix-green-light)' : 'var(--zymix-surface)',
                opacity: active ? 1 : 0.72,
                borderLeftColor: accent,
              }}
            >
              <div className="text-xs font-semibold" style={{ color: accent }}>{p.name}</div>
              <div className="font-bold" style={{ color: 'var(--zymix-text-primary)' }}>{p.role}</div>
              <div className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>{p.ability}</div>
            </div>
          );
        })}
      </div>

      {/* Fate Cards */}
      {state.fateCards.length > 0 && (
        <div className="px-4 pb-2">
          {state.fateCards.map((card, i) => (
            <div key={i} className="mb-2 bubble-in" style={{ animationDelay: `${i * 100}ms`, background: 'var(--zymix-fate-light)', borderRadius: 'var(--radius-card)', padding: '14px 16px', borderLeft: '3px solid var(--zymix-fate)' }}>
              <div className="text-xs" style={{ color: 'var(--zymix-fate)', fontWeight: '600', textTransform: 'uppercase' }}>
                Fate Card · {card.type}
              </div>
              <div className="font-bold mt-1" style={{ color: 'var(--zymix-text-primary)' }}>{card.title}</div>
              <div className="text-sm" style={{ color: 'var(--zymix-text-secondary)' }}>{card.effect}</div>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto pb-4">
        {state.messages.map((msg) => {
          const isSelf = msg.kind === 'action';
          const isNarration = msg.kind === 'narration';
          if (isNarration) {
            return (
              <div key={msg.id} className="narration-box bubble-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{dm.avatar}</span>
                  <span className="text-xs" style={{ color: 'var(--zymix-green)', fontWeight: '600', textTransform: 'uppercase' }}>
                    {dm.name}
                  </span>
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--zymix-text-primary)' }}>{msg.text}</div>
              </div>
            );
          }
          const accent = accentFor(msg.author, state.players);
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''} bubble-in`}>
              {isSelf && (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#E8F8EE' }}>
                    🫵
                  </div>
                  <span className="text-xs" style={{ color: '#1DB954', fontSize: 10 }}>You</span>
                </div>
              )}
              {!isSelf && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: accent }}>
                  {msg.author[0]}
                </div>
              )}
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                {!isSelf && <span className="text-xs px-1 font-medium" style={{ color: accent }}>{msg.author}</span>}
                <div className={`${isSelf ? 'bubble-sent' : 'bubble-received'} text-sm`}>{msg.text}</div>
                {msg.dice && (
                  <div
                    className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: msg.dice.color }}
                  >
                    <span>{msg.dice.emoji}</span>
                    <span>D20 = {msg.dice.value}</span>
                    <span className="opacity-90">· {msg.dice.label}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {state.narratorTyping && <TypingIndicator dm={dm} />}

        {showBigDice && dice && (
          <div className="flex justify-center bubble-in">
            <D20Dice wobbling={diceWobbling} dice={dice} />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Action area — interactive only on the human ("You") turn */}
      {beatPhase === 'action' && activePlayer && isHuman && (
        <div className="p-4" style={footerStyle}>
          <div className="mb-2 text-center text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>
            Your turn · What do you do?
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {actionOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleChooseAction(opt)}
                className="px-4 py-3 text-left rounded-xl transition-colors"
                style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-primary)' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--zymix-green-light)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--zymix-bg)')}
              >
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Or type your own action…"
            className="w-full rounded-full px-4 py-3 text-sm"
            style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-primary)' }}
          />
        </div>
      )}

      {/* NPC turn — show that the AI stand-in is acting */}
      {!isHuman && activePlayer && (beatPhase === 'action' || beatPhase === 'rolling') && (
        <div className="p-4" style={footerStyle}>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--zymix-text-secondary)' }}>
            <span className="text-lg">🎲</span>
            <span>
              {activePlayer.name} is {beatPhase === 'rolling' ? 'rolling the die…' : 'choosing a move…'}
            </span>
          </div>
        </div>
      )}

      {/* Roll button — interactive only on the human ("You") turn */}
      {beatPhase === 'rolling' && isHuman && (
        <div className="p-4" style={footerStyle}>
          <button onClick={() => performRoll(rollPlayerValue())} className="btn-zymix-primary">
            🎲 Roll the die
          </button>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
