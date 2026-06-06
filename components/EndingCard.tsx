/**
 * EndingCard — 结束卡 (Zymix Native UI, themed for light + dark)
 */
export default function EndingCard({ card, onPlayAgain, onShare }: {
  card: { title: string; caption: string; best_interference: string; final_roll: number; cta: string } | null;
  onPlayAgain: () => void;
  onShare: () => void;
}) {
  if (!card) return null;

  return (
    <div className="flex flex-col items-center justify-center p-6" style={{ background: 'var(--zymix-bg)', minHeight: 'calc(100vh - 56px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up" style={{ background: 'var(--zymix-surface)', boxShadow: 'var(--shadow-card)' }}>
        {/* Header (brand green — same in both themes) */}
        <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #1DB954 0%, #17a347 100%)' }}>
          <div className="text-4xl mb-2">🎭</div>
          <h2 className="text-xl font-bold text-white">{card.title}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{card.caption}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="text-xs font-semibold" style={{ color: 'var(--zymix-text-tertiary)', textTransform: 'uppercase' }}>Best Interference</div>
            <div className="font-bold mt-1" style={{ color: 'var(--zymix-text-primary)' }}>{card.best_interference}</div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-semibold" style={{ color: 'var(--zymix-text-tertiary)', textTransform: 'uppercase' }}>Final Roll</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-2xl">🎲</div>
              <div className="font-bold text-2xl" style={{ color: 'var(--zymix-green)' }}>{card.final_roll}</div>
            </div>
          </div>

          <div className="text-center pt-4" style={{ borderTop: '1px solid var(--zymix-divider)' }}>
            <p className="text-sm" style={{ color: 'var(--zymix-text-secondary)' }}>{card.cta}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 px-4 flex flex-col gap-3 w-full max-w-sm">
        <button onClick={onShare} className="btn-zymix-primary">
          📤 Share Quest Card
        </button>
        <button onClick={onPlayAgain} className="py-3 rounded-full font-semibold" style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}>
          Play again 🔁
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
