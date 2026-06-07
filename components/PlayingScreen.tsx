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

type GameHook = ReturnType<typeof useGameState>;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const FALLBACK_EMOJI = ['🎯', '🔍', '💡', '🔥', '🗝️', '✨'];
// AI teammates don't drive the branch, so they get short supportive side-actions
// instead of the protagonist's options (which read weird coming from them).
const NPC_FLAVOR = ['backs you up 💪', 'films the whole thing 🎥', 'digs for receipts 📸', 'tries to keep the peace 🕊️', 'panics quietly 😬', 'hypes you up 🙌', 'reads the room 👀', 'makes it worse, lovingly 🤡'];

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
  const { state, currentChoices, commonActions, resolveActorChoice, currentActor, getStoryRef, sendChat, spendHelp } = game;

  const TEXT = {
    commonActions: ['🔍 Look for another angle', '🤝 Rally the others', '🎲 Just wing it'],
    invite: '🔗 Invite a friend to twist the story (5 min)',
    tension: '⚠️ Tension',
    fateCard: 'Fate Card',
    yourMove: `🎭 You · `,
    yourMoveLabel: 'your move',
    common: 'Common',
    npcRolling: 'rolling the die…',
    npcChoosing: 'choosing a move…',
    rollHint: 'Roll the die',
    actionHint: (label: string) => `"${label}" — roll to see how it goes`,
    help: (left: number) => `🤝 Ask a teammate — advantage (${left} left)`,
    placeholder: 'Say something to the group…',
    paysOff: "'s move pays off.",
    hitsSnag: "'s move hits a snag.",
  };

  const COMMON_ACTIONS = TEXT.commonActions;
  const [beatPhase, setBeatPhase] = useState<'choosing' | 'rolling' | 'resolving'>('choosing');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dice, setDice] = useState<DiceRoll | null>(null);
  const [diceWobbling, setDiceWobbling] = useState(false);
  const [showBigDice, setShowBigDice] = useState(false);
  const [customText, setCustomText] = useState('');

  const endRef = useRef<HTMLDivElement>(null);
  const lastNodeRef = useRef<string>('');
  const lastActorIndexRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const npcActionRef = useRef<string>('');

  const dm = dmFor(state.theme);
  const currentPlayer = currentActor();
  const isHuman = currentPlayer?.name === 'You';
  const currentStory = getStoryRef();
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
    npcActionRef.current = NPC_FLAVOR[Math.floor(Math.random() * NPC_FLAVOR.length)];
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

  const copyInvite = () => {
    if (!state.shareUrl) return;
    navigator.clipboard?.writeText(state.shareUrl);
    alert('Invite link copied — it disappears in 5 minutes!');
  };

  const footerStyle = { background: 'var(--zymix-surface)', borderTop: '1px solid var(--zymix-border)' };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Invite outsiders to drop a 5-minute twist into the story */}
      <button
        onClick={copyInvite}
        className="mx-4 mt-3 flex-shrink-0 flex items-center justify-center gap-2 rounded-full py-2 text-xs font-medium active:scale-[0.98] transition-transform"
        style={{ background: 'var(--zymix-fate-light)', color: 'var(--zymix-fate)' }}
      >
        {TEXT.invite}
      </button>

      {/* Doom clock — failure raises tension; 100% collapses the run */}
      <div className="mx-4 mt-2 flex-shrink-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium" style={{ color: 'var(--zymix-text-tertiary)' }}>{TEXT.tension}</span>
          <span className="text-xs font-bold" style={{ color: state.tension > 70 ? '#EF4444' : state.tension > 40 ? '#F59E0B' : 'var(--zymix-green)' }}>{state.tension}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--zymix-border)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${state.tension}%`, background: state.tension > 70 ? '#EF4444' : state.tension > 40 ? '#F59E0B' : '#1DB954' }} />
        </div>
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

        {state.narratorTyping && <TypingIndicator dm={dm} />}

        {showBigDice && dice && (
          <div className="flex justify-center bubble-in">
            <D20Dice wobbling={diceWobbling} dice={dice} />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Bottom sheet: move UI (chips / NPC indicator / roll) + persistent chat composer */}
      {state.ready && state.phase === 'playing' && (
        <div className="rc-sheet px-4 pt-3.5 pb-3">
          {/* Your turn — role branches (green) + common actions (grey) */}
          {beatPhase === 'choosing' && isHuman && choices.length > 0 && (
            <>
              <div className="rc-label mb-2 px-0.5">{TEXT.yourMove}{roleOf('You')} — {TEXT.yourMoveLabel}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {choices.map((c, i) => (
                  <button key={i} onClick={() => handleChoose(i)} className="rc-chip rc-chip-special">
                    {(c.emoji ?? FALLBACK_EMOJI[i % FALLBACK_EMOJI.length])} {c.label}
                  </button>
                ))}
              </div>
              <div className="rc-label mb-2 px-0.5">{TEXT.common}</div>
              <div className="flex flex-wrap gap-2 mb-3.5">
                {(commonActions().length ? commonActions() : COMMON_ACTIONS).map((label, i) => (
                  <button key={i} onClick={() => handleChoose(0)} className="rc-chip rc-chip-common">{label}</button>
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

      <div className="h-6" />
    </div>
  );
}
