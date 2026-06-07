/**
 * EndingCard — end-of-game card (story-first: a real ending + the night's highlight).
 */
export default function EndingCard({ card, onPlayAgain, onShare }: {
  card: {
    title: string;
    caption: string;
    best_interference: string;
    final_roll: number;
    cta: string;
    epilogue?: string;
    highlight?: string;
    marks?: Array<{ kind: 'boon' | 'scar'; text: string }>;
  } | null;
  onPlayAgain: () => void;
  onShare: () => void;
}) {
  if (!card) return null;
  const highlight = card.highlight && card.highlight !== '—' ? card.highlight : '';

  const TEXT = {
    highlight: '✨ Highlight of the night',
    carried: 'What you carried',
    finalRoll: '🎲 Final roll',
    share: '📤 Share Quest Card',
    playAgain: 'Play again 🔁',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6" style={{ background: 'var(--zymix-bg)', minHeight: 'calc(100vh - 56px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up" style={{ background: 'var(--zymix-surface)', boxShadow: 'var(--shadow-card)' }}>
        {/* Header (brand green) */}
        <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #1DB954 0%, #17a347 100%)' }}>
          <div className="text-4xl mb-2">🎭</div>
          <h2 className="text-xl font-bold text-white">{card.title}</h2>
          <p className="text-sm mt-1 italic" style={{ color: 'rgba(255,255,255,0.92)' }}>“{card.caption}”</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* The ending — a real written conclusion, not stats */}
          {card.epilogue && (
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--zymix-text-primary)' }}>
              {card.epilogue}
            </p>
          )}

          {/* The night's standout moment */}
          {highlight && (
            <div className="mb-5 rounded-xl p-3.5" style={{ background: 'var(--zymix-green-light)', borderLeft: '3px solid var(--zymix-green)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--zymix-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {TEXT.highlight}
              </div>
              <div className="text-sm leading-snug" style={{ color: 'var(--zymix-text-primary)' }}>{highlight}</div>
            </div>
          )}

          {/* What you carried — nat-20 boons & nat-1 scars */}
          {card.marks && card.marks.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--zymix-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {TEXT.carried}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.marks.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={m.kind === 'boon'
                      ? { background: 'var(--zymix-green-light)', color: 'var(--zymix-green)' }
                      : { background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                  >
                    {m.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Small stat footer */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--zymix-divider)' }}>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--zymix-text-tertiary)' }}>
              {TEXT.finalRoll} <span className="font-bold" style={{ color: 'var(--zymix-green)' }}>{card.final_roll}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--zymix-text-secondary)' }}>{card.cta}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 px-4 flex flex-col gap-3 w-full max-w-sm">
        <button onClick={onShare} className="btn-zymix-primary">{TEXT.share}</button>
        <button onClick={onPlayAgain} className="py-3 rounded-full font-semibold" style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}>
          {TEXT.playAgain}
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
