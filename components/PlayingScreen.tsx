/**
 * PlayingScreen — branching story play with team-based turns.
 *
 * The group takes turns: each member picks a branch, rolls a D20, and their
 * choice + roll is recorded. After everyone has acted, the DM advances the
 * story based on the team's collective decisions. Group-chat feel with multiple
 * perspectives and role-specific choices.
 */
import { useEffect, useRef, useState } from 'react';
import type { useGameState } from '@/hooks/useGameState';
import { toDiceRoll, rollPlayerValue, rollNPCValue, type DiceRoll } from '@/lib/dice';
import { accentFor, dmFor, type DM } from '@/lib/theme';
import { getChoicesForActor } from '@/lib/branchingEngine';
import ChatAvatar from './ChatAvatar';

const DM_COLOR = '#7C3AED';

type GameHook = ReturnType<typeof useGameState>;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const FALLBACK_EMOJI = ['🎯', '🔍', '💡', '🔥', '🗝️', '✨'];
// AI teammates don't drive the branch, so they get short supportive side-actions
// instead of the protagonist's options (which read weird coming from them).
const NPC_FLAVOR = ['backs you up 💪', 'films the whole thing 🎥', 'digs for receipts 📸', 'tries to keep the peace 🕊️', 'panics quietly 😬', 'hypes you up 🙌', 'reads the room 👀', 'makes it worse, lovingly 🤡'];
// Generic fallback if a story has no themed twists.
const DEFAULT_TWISTS = [
  { icon: '🌀', title: 'Bend the storyline', detail: 'reroute where the next scene goes' },
  { icon: '🎭', title: 'Add a new character', detail: 'drop someone into the chat mid-scene' },
  { icon: '🔥', title: 'Raise the stakes', detail: 'spike the tension or flip the goal' },
  { icon: '✨', title: 'Fuse in a wildcard', detail: 'blend a fresh thread into the plot' },
];

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
function TypingIndicator({ dm, accent }: { dm: DM; accent: string }) {
  return (
    <div className="flex items-end gap-2 bubble-in">
      <ChatAvatar glyph={dm.avatar} color={accent} size={32} />
      <div className="bubble-received flex items-center gap-1.5" style={{ paddingTop: 13, paddingBottom: 13 }}>
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
        <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

export default function PlayingScreen({ game }: { game: GameHook }) {
  const { state, currentChoices, resolveActorChoice, currentActor, getStoryRef, sendChat, spendHelp } = game;

  const TEXT = {
    tension: '⚠️ Tension',
    fateCard: 'Fate Card',
    yourMove: `🎭 You · `,
    yourMoveLabel: 'your move',
    npcRolling: 'rolling the die…',
    npcChoosing: 'choosing a move…',
    rollHint: 'Roll the die',
    actionHint: (label: string) => `"${label}" — roll to see how it goes`,
    help: (left: number) => `🤝 Ask a teammate — advantage (${left} left)`,
    placeholder: 'Say something to the group…',
    paysOff: "'s move pays off.",
    hitsSnag: "'s move hits a snag.",
  };

  const [beatPhase, setBeatPhase] = useState<'choosing' | 'rolling' | 'resolving'>('choosing');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dice, setDice] = useState<DiceRoll | null>(null);
  const [diceWobbling, setDiceWobbling] = useState(false);
  const [showBigDice, setShowBigDice] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const lastNodeRef = useRef<string>('');
  const lastActorIndexRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const npcActionRef = useRef<string>('');

  const dm = dmFor(state.theme);
  const currentPlayer = currentActor();
  const isHuman = currentPlayer?.name === 'You';
  const currentStory = getStoryRef();
  const accentColor = currentStory?.accent ?? DM_COLOR;
  const choices = (currentPlayer && currentStory) ? getChoicesForActor(
    currentStory,
    state.nodeId,
    currentPlayer.name,
  ) : currentChoices();

  // Role of any player
  const roleOf = (name: string) => state.players.find((p) => p.name === name)?.role ?? name;

  // Auto-scroll to the latest message / indicator.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length, state.narratorTyping, diceWobbling, beatPhase]);

  // When the story advances to a new node or actor changes, reset choices.
  useEffect(() => {
    if (state.phase !== 'playing' || !state.nodeId) return;
    // Reset when node changes OR when starting a new round (actor index resets to 0)
    const nodeChanged = state.nodeId !== lastNodeRef.current;
    const roundStarted = state.currentActorIndex === 0 && lastActorIndexRef.current > 0;
    const actorChanged = state.currentActorIndex !== lastActorIndexRef.current;

    if (nodeChanged || roundStarted) {
      lastNodeRef.current = state.nodeId;
      setSelectedIndex(null);
      setDice(null);
      setBeatPhase('choosing');
    }

    if (actorChanged) {
      lastActorIndexRef.current = state.currentActorIndex;
      setSelectedIndex(null);
      setBeatPhase('choosing');
    }
  }, [state.nodeId, state.currentActorIndex, state.phase]);

  const handleChoose = (i: number) => {
    setSelectedIndex(i);
    setBeatPhase('rolling');
  };

  const performRoll = async (roll: number, overrideLabel?: string) => {
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
    await resolveActorChoice(selectedIndex, roll, overrideLabel);
    // The node-watch effect resets to 'choosing' when the next node/actor arrives;
    // an ending instead flips phase to 'ended' (this screen unmounts).
  };

  // NPC auto-play — pick a short role-flavored side-action (not a branch option).
  useEffect(() => {
    if (!state.ready || state.phase !== 'playing' || !currentPlayer || currentPlayer.name === 'You') return;
    if (beatPhase !== 'choosing') return;
    const pool = currentStory?.reactions?.length ? currentStory.reactions : NPC_FLAVOR;
    npcActionRef.current = pool[Math.floor(Math.random() * pool.length)];
    const t = setTimeout(() => { setSelectedIndex(0); setBeatPhase('rolling'); }, 850);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready, state.phase, currentPlayer, beatPhase, state.currentActorIndex, state.nodeId]);

  // NPC auto-play — auto-roll once the NPC has picked.
  useEffect(() => {
    if (!state.ready || state.phase !== 'playing' || !currentPlayer || currentPlayer.name === 'You') return;
    if (beatPhase !== 'rolling' || selectedIndex == null) return;
    const t = setTimeout(() => performRoll(rollNPCValue(), npcActionRef.current), 850);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready, state.phase, currentPlayer, beatPhase, selectedIndex]);

  const inviteUrl = state.shareUrl || 'https://zymix.app/rollcall/join/4B-twist';
  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 1800);
  };

  // Doom-clock colour + icon escalate with tension.
  const tColor = state.tension > 70 ? '#EF4444' : state.tension > 40 ? '#F59E0B' : accentColor;
  const tIcon = state.tension > 70 ? '🔥' : '⚠️';

  // Decorative QR pattern for the invite sheet (illustrative, not a real code).
  const QR = ['101101', '011010', '110011', '101101', '010110', '101011'];

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Invite outsiders to drop a twist into the story (details live in the sheet) */}
      <button
        onClick={() => setShowInvite(true)}
        className="mx-4 mt-3 flex-shrink-0 flex items-center gap-2 rounded-full px-3.5 py-2 active:scale-[0.99] transition-transform"
        style={{ background: 'var(--zymix-fate-light)', border: '1.5px dashed var(--zymix-fate)' }}
      >
        <span className="text-sm flex-shrink-0">🔗</span>
        <span className="flex-1 text-left text-xs font-semibold" style={{ color: 'var(--zymix-fate)' }}>Invite a friend</span>
        <span className="text-base font-bold flex-shrink-0" style={{ color: 'var(--zymix-fate)' }}>›</span>
      </button>

      {/* Goal + crisis meter, merged — what you're chasing + how close to disaster */}
      <div className="mx-4 mt-2 flex-shrink-0 rounded-2xl px-3.5 py-2.5" style={{ background: 'var(--zymix-surface)', border: '1px solid var(--zymix-border)' }}>
        {currentStory?.goalShort && (
          <div className="flex items-center gap-1.5 mb-2 pb-2" style={{ borderBottom: '1px solid var(--zymix-divider)' }}>
            <span className="text-sm flex-shrink-0">🎯</span>
            <span className="text-xs font-semibold truncate" style={{ color: 'var(--zymix-green)' }}>{currentStory.goalShort}</span>
          </div>
        )}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--zymix-text-secondary)' }}>
            {currentStory?.crisisMeter?.emoji ?? tIcon} {currentStory?.crisisMeter?.name ?? 'Tension'}
          </span>
          <span className="text-xs font-extrabold tabular-nums flex items-center gap-1" style={{ color: tColor }}>
            {state.lastTensionDelta !== 0 && (
              <span className="text-[10px]" style={{ color: state.lastTensionDelta > 0 ? '#EF4444' : '#1DB954' }}>
                {state.lastTensionDelta > 0 ? `▲${state.lastTensionDelta}` : `▼${-state.lastTensionDelta}`}
              </span>
            )}
            {state.tension}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--zymix-bg)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${state.tension}%`, background: `linear-gradient(90deg, ${tColor}99, ${tColor})` }} />
        </div>
        <div className="text-[10px] mt-1" style={{ color: 'var(--zymix-text-tertiary)' }}>Fails heat it up, wins cool it down — fill it and the night falls apart.</div>
      </div>

      {/* Fate Cards (friend interference) */}
      {state.fateCards.length > 0 && (
        <div className="px-4 pb-2">
          {state.fateCards.map((card, i) => (
            <div key={i} className="mb-2 bubble-in" style={{ animationDelay: `${i * 100}ms`, background: 'var(--zymix-fate-light)', borderRadius: 'var(--radius-card)', padding: '14px 16px', borderLeft: '3px solid var(--zymix-fate)' }}>
              <div className="text-xs" style={{ color: 'var(--zymix-fate)', fontWeight: '600', textTransform: 'uppercase' }}>{TEXT.fateCard} · {card.type}</div>
              <div className="font-bold mt-1" style={{ color: 'var(--zymix-text-primary)' }}>{card.title}</div>
              <div className="text-sm" style={{ color: 'var(--zymix-text-secondary)' }}>{card.effect}</div>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 px-4 flex flex-col gap-2 overflow-y-auto pb-4">
        {state.messages.map((msg) => {
          const isSelf = msg.kind === 'action' && msg.author === 'You';
          if (msg.kind === 'narration') {
            // DM speaks in a left-aligned chat bubble (avatar + name + bubble).
            return (
              <div key={msg.id} className="flex items-end gap-2 bubble-in">
                <ChatAvatar glyph={dm.avatar} color={accentColor} />
                <div className="flex flex-col gap-0.5 max-w-[78%] items-start">
                  <span className="text-xs px-1 font-medium" style={{ color: accentColor }}>{dm.name}</span>
                  <div className="bubble-received text-sm leading-relaxed">{msg.text}</div>
                </div>
              </div>
            );
          }
          const accent = accentFor(msg.author, state.players);
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''} bubble-in`}>
              <ChatAvatar glyph={msg.author[0]} color={accent} />
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}>
                <span className="text-xs px-1 font-medium" style={{ color: accent }}>{isSelf ? `You · ${roleOf('You')}` : `${msg.author} · ${roleOf(msg.author)}`}</span>

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
                    <span>{roleOf(msg.author)}{msg.dice.value >= 11 ? TEXT.paysOff : TEXT.hitsSnag}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {state.narratorTyping && <TypingIndicator dm={dm} accent={accentColor} />}

        {showBigDice && dice && (
          <div className="flex justify-center bubble-in">
            <D20Dice wobbling={diceWobbling} dice={dice} />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Bottom sheet: move UI (chips / NPC indicator / roll) + persistent chat composer */}
      {state.ready && state.phase === 'playing' && (
        <div className="rc-sheet px-4 pt-2 pb-3">
          <div className="rc-sheet-grabber" />
          {/* Your turn — only the branch choices that actually route the story. */}
          {beatPhase === 'choosing' && isHuman && choices.length > 0 && (
            <>
              <div className="rc-label mb-2 px-0.5">{TEXT.yourMove}{roleOf('You')} — {TEXT.yourMoveLabel}</div>
              <div className="flex flex-wrap gap-2 mb-3.5">
                {choices.map((c, i) => (
                  <button key={i} onClick={() => handleChoose(i)} className="rc-chip rc-chip-special">
                    {(c.emoji ?? FALLBACK_EMOJI[i % FALLBACK_EMOJI.length])} {c.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* NPC turn — auto-play */}
          {!isHuman && currentPlayer && (beatPhase === 'choosing' || beatPhase === 'rolling') && (
            <div className="mb-3.5 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--zymix-text-secondary)' }}>
              <span className="text-lg">🎲</span>
              <span>{currentPlayer.name} is {beatPhase === 'rolling' ? TEXT.npcRolling : TEXT.npcChoosing}</span>
            </div>
          )}

          {/* Your roll */}
          {beatPhase === 'rolling' && isHuman && (
            <div className="mb-3.5">
              <div className="mb-2 text-center text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>
                {selectedIndex != null && choices[selectedIndex] ? TEXT.actionHint(choices[selectedIndex].label) : TEXT.rollHint}
              </div>
              <button onClick={() => performRoll(rollPlayerValue())} className="btn-zymix-primary">🎲 {TEXT.rollHint}</button>
              {state.helpTokens > 0 && (
                <button
                  onClick={() => { if (spendHelp()) performRoll(Math.max(rollPlayerValue(), rollPlayerValue())); }}
                  className="rc-chip rc-chip-common mt-2 w-full justify-center"
                >
                  {TEXT.help(state.helpTokens)}
                </button>
              )}
            </div>
          )}

          {/* Persistent chat composer — type to chat (your bubble); does NOT advance the story */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { sendChat(customText); setCustomText(''); } }}
              type="text"
              placeholder={TEXT.placeholder}
              className="rc-composer-input"
            />
            <button onClick={() => { sendChat(customText); setCustomText(''); }} aria-label="Send message" className="rc-send-btn">
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Invite sheet — illustrative mockup of the share / friend-join flow */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowInvite(false)}
        >
          <div
            className="w-full max-w-md p-5 animate-slide-up"
            style={{ background: 'var(--zymix-surface)', borderRadius: '22px 22px 0 0', boxShadow: 'var(--shadow-sheet)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rc-sheet-grabber" />

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl text-lg flex-shrink-0" style={{ background: 'var(--zymix-fate-light)' }}>🔗</span>
                <div>
                  <div className="font-bold text-base" style={{ color: 'var(--zymix-text-primary)' }}>Invite a friend</div>
                  <div className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>They twist the story for 5 minutes</div>
                </div>
              </div>
              <button onClick={() => setShowInvite(false)} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none" style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-secondary)' }}>×</button>
            </div>

            {/* Faux QR */}
            <div className="flex justify-center my-2">
              <div className="p-3 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid var(--zymix-border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 15px)', gridAutoRows: '15px', gap: '3px' }}>
                  {QR.join('').split('').map((c, i) => (
                    <div key={i} style={{ background: c === '1' ? 'var(--zymix-fate)' : 'transparent', borderRadius: '3px' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Who's in (illustrative) */}
            <div className="flex items-center justify-center gap-1.5 mb-3">
              {['M', 'A', 'K'].map((x, i) => (
                <span key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: ['#FF6B6B', '#1DB954', '#45B7D1'][i] }}>{x}</span>
              ))}
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ border: '1.5px dashed var(--zymix-fate)', color: 'var(--zymix-fate)', animation: 'pulse 1.6s ease-in-out infinite' }}>+</span>
              <span className="text-xs ml-1" style={{ color: 'var(--zymix-text-tertiary)' }}>waiting for 1 more…</span>
            </div>

            {/* What a friend's twist actually does to the story */}
            <div className="rounded-2xl p-3 mb-3" style={{ background: 'var(--zymix-fate-light)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--zymix-fate)' }}>A friend&apos;s twist can change the story…</div>
              <ul className="flex flex-col gap-1.5">
                {(currentStory?.twists ?? DEFAULT_TWISTS).map((tw, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sm leading-5 flex-shrink-0">{tw.icon}</span>
                    <span className="text-xs leading-5" style={{ color: 'var(--zymix-text-secondary)' }}>
                      <span className="font-semibold" style={{ color: 'var(--zymix-text-primary)' }}>{tw.title}</span> — {tw.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Link + copy */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 truncate text-xs px-3 py-2.5 rounded-full" style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}>{inviteUrl}</div>
              <button onClick={copyInvite} className="px-4 py-2.5 rounded-full text-xs font-semibold flex-shrink-0 text-white transition-colors" style={{ background: inviteCopied ? '#1DB954' : 'var(--zymix-fate)' }}>{inviteCopied ? 'Copied ✓' : 'Copy'}</button>
            </div>

            <p className="text-[11px] text-center mb-3 leading-relaxed" style={{ color: 'var(--zymix-text-tertiary)' }}>
              The link self-destructs in 5 minutes. Your friend gets one chaos card to drop into the story — no account needed.
            </p>

            <button onClick={() => setShowInvite(false)} className="btn-zymix-primary">Got it</button>
            <div className="pb-safe" />
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
