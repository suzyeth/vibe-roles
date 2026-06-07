/**
 * PlayingScreen — branching story play.
 *
 * You are the protagonist: the DM narrates a scene (a chat bubble), you pick one
 * of its branches, roll a D20, and success/failure routes the story to a new
 * node — until it reaches a real ending. AI members chime in as flavour. Group-
 * chat feel: DM "typing…" bubble, animated D20, spring-in messages, per-player
 * accent colors, themed via CSS tokens (light + dark).
 */
import { useEffect, useRef, useState } from 'react';
import type { useGameState } from '@/hooks/useGameState';
import { toDiceRoll, rollPlayerValue, type DiceRoll } from '@/lib/dice';
import { accentFor, dmFor, type DM } from '@/lib/theme';

type GameHook = ReturnType<typeof useGameState>;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const FALLBACK_EMOJI = ['🎯', '🔍', '💡', '🔥', '🗝️', '✨'];
// Universal fallback actions, shown as the grey "common" group under the
// role-specific branches. They resolve along the node's baseline branch.
const COMMON_ACTIONS = ['🔍 Look for another angle', '🤝 Rally the others', '🎲 Just wing it'];

// ─── Animated D20 die ──────────────────────────────────────────────────────
function D20Dice({ wobbling, dice }: { wobbling: boolean; dice: DiceRoll }) {
  return (
    <div className="flex flex-col items-center gap-2 my-1">
      <div className={`flex items-center justify-center ${wobbling ? 'dice-rolling' : ''}`} style={{ width: 72, height: 72 }}>
        <svg width="72" height="72" viewBox="0 0 80 80">
          <polygon points="40,4 76,62 4,62" fill={wobbling ? '#1DB954' : dice.color} stroke="#fff" strokeWidth="2" opacity="0.95" />
          <polygon points="40,76 76,62 4,62" fill={wobbling ? '#17a347' : dice.color} stroke="#fff" strokeWidth="2" opacity="0.65" />
          <text x="40" y="48" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">{wobbling ? '?' : dice.value}</text>
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
  const { state, currentChoices, resolveChoice } = game;
  const [beatPhase, setBeatPhase] = useState<'choosing' | 'rolling' | 'resolving'>('choosing');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dice, setDice] = useState<DiceRoll | null>(null);
  const [diceWobbling, setDiceWobbling] = useState(false);
  const [showBigDice, setShowBigDice] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const lastNodeRef = useRef<string>('');

  const dm = dmFor(state.theme);
  const choices = currentChoices();
  // The protagonist's in-story identity, so the chat shows WHO is deciding
  // (their role) instead of a faceless "You".
  const youRole = state.players.find((p) => p.name === 'You')?.role ?? 'You';
  const roleOf = (name: string) => state.players.find((p) => p.name === name)?.role ?? name;

  // Auto-scroll to the latest message / indicator.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length, state.narratorTyping, diceWobbling, beatPhase]);

  // When the story advances to a new node, open its choices.
  useEffect(() => {
    if (state.phase !== 'playing' || !state.nodeId) return;
    if (state.nodeId === lastNodeRef.current) return;
    lastNodeRef.current = state.nodeId;
    setSelectedIndex(null);
    setDice(null);
    setBeatPhase('choosing');
  }, [state.nodeId, state.phase]);

  const handleChoose = (i: number) => {
    setSelectedIndex(i);
    setBeatPhase('rolling');
  };

  const performRoll = async (roll: number) => {
    if (selectedIndex == null) return;
    const d = toDiceRoll(roll);
    setDice(d);
    setDiceWobbling(true);
    setShowBigDice(true);
    setBeatPhase('resolving');
    await delay(1100);
    setDiceWobbling(false);
    await delay(750);
    setShowBigDice(false);
    await resolveChoice(selectedIndex, roll);
    // The node-watch effect resets to 'choosing' when the next node arrives;
    // an ending instead flips phase to 'ended' (this screen unmounts).
  };

  const copyInvite = () => {
    if (!state.shareUrl) return;
    navigator.clipboard?.writeText(state.shareUrl);
    alert('Invite link copied — it disappears in 5 minutes!');
  };

  const footerStyle = { background: 'var(--zymix-surface)', borderTop: '1px solid var(--zymix-border)' };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Invite outsiders to drop a 5-minute twist into the story */}
      <button
        onClick={copyInvite}
        className="mx-4 mt-3 flex items-center justify-center gap-2 rounded-full py-2 text-xs font-medium active:scale-[0.98] transition-transform"
        style={{ background: 'var(--zymix-fate-light)', color: 'var(--zymix-fate)' }}
      >
        🔗 Invite a friend to twist the story (5 min)
      </button>

      {/* Player cards — each tinted with its owner's accent color */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {state.players.map((p, i) => {
          const accent = accentFor(p.name, state.players);
          return (
            <div key={p.name} className="role-card flex-shrink-0 bubble-in" style={{ animationDelay: `${i * 60}ms`, background: 'var(--zymix-surface)', borderLeftColor: accent }}>
              <div className="text-xs font-semibold" style={{ color: accent }}>{p.name}</div>
              <div className="font-bold" style={{ color: 'var(--zymix-text-primary)' }}>{p.role}</div>
              <div className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>{p.ability}</div>
            </div>
          );
        })}
      </div>

      {/* Fate Cards (friend interference) */}
      {state.fateCards.length > 0 && (
        <div className="px-4 pb-2">
          {state.fateCards.map((card, i) => (
            <div key={i} className="mb-2 bubble-in" style={{ animationDelay: `${i * 100}ms`, background: 'var(--zymix-fate-light)', borderRadius: 'var(--radius-card)', padding: '14px 16px', borderLeft: '3px solid var(--zymix-fate)' }}>
              <div className="text-xs" style={{ color: 'var(--zymix-fate)', fontWeight: '600', textTransform: 'uppercase' }}>Fate Card · {card.type}</div>
              <div className="font-bold mt-1" style={{ color: 'var(--zymix-text-primary)' }}>{card.title}</div>
              <div className="text-sm" style={{ color: 'var(--zymix-text-secondary)' }}>{card.effect}</div>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto pb-4">
        {state.messages.map((msg) => {
          const isSelf = msg.kind === 'action' && msg.author === 'You';
          if (msg.kind === 'narration') {
            // DM speaks in a left-aligned chat bubble (avatar + name + bubble).
            return (
              <div key={msg.id} className="flex items-end gap-2 bubble-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--zymix-fate-light)' }}>
                  {dm.avatar}
                </div>
                <div className="flex flex-col gap-0.5 max-w-[78%] items-start">
                  <span className="text-xs px-1 font-medium" style={{ color: 'var(--zymix-fate)' }}>{dm.name}</span>
                  <div className="bubble-received text-sm leading-relaxed">{msg.text}</div>
                </div>
              </div>
            );
          }
          const accent = accentFor(msg.author, state.players);
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''} bubble-in`}>
              {!isSelf && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: accent }}>
                  {msg.author[0]}
                </div>
              )}
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                <span className="text-xs px-1 font-medium" style={{ color: accent }}>{isSelf ? `You · ${youRole}` : `${msg.author} · ${roleOf(msg.author)}`}</span>

                <div className={`${isSelf ? 'bubble-sent' : 'bubble-received'} text-sm`}>{msg.text}</div>
                {msg.dice && (
                  <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: msg.dice.color }}>
                    <span>{msg.dice.emoji}</span>
                    <span>D20 = {msg.dice.value}</span>
                    <span className="opacity-90">· {msg.dice.label}</span>
                  </div>
                )}
                {msg.dice && (
                  <div className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: msg.dice.value >= 11 ? 'var(--zymix-green)' : '#F97316' }}>
                    <span>{msg.dice.value >= 11 ? '✅' : '⚠️'}</span>
                    <span>{roleOf(msg.author)}{msg.dice.value >= 11 ? "'s move pays off." : "'s move hits a snag."}</span>
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

      {/* Branch choices — role-specific (green) + common (grey) */}
      {state.ready && state.phase === 'playing' && beatPhase === 'choosing' && choices.length > 0 && (
        <div className="p-3" style={footerStyle}>
          <div className="text-xs mb-1.5 px-1 font-medium" style={{ color: 'var(--zymix-text-tertiary)' }}>
            🎭 You · {youRole} — your move
          </div>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                className="px-3 py-2 rounded-full text-sm font-medium transition-transform active:scale-95"
                style={{ background: 'var(--zymix-green-light)', color: 'var(--zymix-green)', border: '1px solid var(--zymix-green)' }}
              >
                {(c.emoji ?? FALLBACK_EMOJI[i % FALLBACK_EMOJI.length])} {c.label}
              </button>
            ))}
          </div>
          <div className="text-xs mb-1.5 px-1 font-medium" style={{ color: 'var(--zymix-text-tertiary)' }}>
            Common options
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_ACTIONS.map((label, i) => (
              <button
                key={i}
                onClick={() => handleChoose(0)}
                className="px-3 py-2 rounded-full text-sm font-medium transition-transform active:scale-95"
                style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-primary)', border: '1px solid var(--zymix-border)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Roll the die for the chosen branch */}
      {beatPhase === 'rolling' && (
        <div className="p-4" style={footerStyle}>
          <div className="mb-2 text-center text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>
            {selectedIndex != null && choices[selectedIndex] ? `“${choices[selectedIndex].label}” — roll to see how it goes` : 'Roll the die'}
          </div>
          <button onClick={() => performRoll(rollPlayerValue())} className="btn-zymix-primary">
            🎲 Roll the die
          </button>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
