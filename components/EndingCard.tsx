/**
 * EndingCard — end-of-game card (story-first: a real ending + the night's
 * highlight). Themed by outcome tone: a win glows green, a bittersweet ending
 * goes purple, an unravelling one goes slate — so the card reads the result
 * at a glance instead of always celebrating.
 */
type Tone = 'win' | 'mixed' | 'down';

const TONE: Record<Tone, { grad: string; glyph: string; badge: string; accent: string; accentSoft: string }> = {
  win: {
    grad: 'linear-gradient(135deg, #1DB954 0%, #17a347 100%)',
    glyph: '🏆', badge: 'A real W',
    accent: '#1DB954', accentSoft: 'var(--zymix-green-light)',
  },
  mixed: {
    grad: 'linear-gradient(135deg, #7C3AED 0%, #9d5cf0 100%)',
    glyph: '🤝', badge: 'Bittersweet',
    accent: '#7C3AED', accentSoft: 'var(--zymix-fate-light)',
  },
  down: {
    grad: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    glyph: '🫥', badge: 'It unravelled',
    accent: '#64748B', accentSoft: 'rgba(100,116,139,0.14)',
  },
};

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
    tone?: Tone;
    theme?: string;
    events?: Array<{ actorName: string; role: string; kind: 'boon' | 'chaos'; line: string }>;
    pivotal?: { actorName: string; kind: 'boon' | 'chaos'; coda: string } | null;
  } | null;
  onPlayAgain: () => void;
  onShare: () => void;
}) {
  if (!card) return null;
  const t = TONE[card.tone ?? 'win'];
  const highlight = card.highlight && card.highlight !== '—' ? card.highlight : '';

  // Turning points can repeat across the run — show at most 2 distinct ones.
  const topEvents = (() => {
    const seen = new Set<string>();
    const out: NonNullable<typeof card.events> = [];
    for (const e of card.events ?? []) {
      if (seen.has(e.line)) continue;
      seen.add(e.line);
      out.push(e);
      if (out.length === 2) break;
    }
    return out;
  })();

  return (
    <div className="flex flex-col items-center justify-center p-6" style={{ background: 'var(--zymix-bg)', minHeight: 'calc(100vh - 56px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up" style={{ background: 'var(--zymix-surface)', boxShadow: 'var(--shadow-card)' }}>
        {/* Header — tinted by outcome */}
        <div className="p-6 text-center" style={{ background: t.grad }}>
          {card.theme && (
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
              🎭 {card.theme}
            </div>
          )}
          <div className="text-4xl mb-2">{t.glyph}</div>
          {/* Result badge */}
          <div className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
            {t.badge}
          </div>
          {card.pivotal && (
            <div className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 ml-1" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
              {card.pivotal.kind === 'boon' ? `✨ Saved by ${card.pivotal.actorName}` : `💀 ${card.pivotal.actorName} nearly sank it`}
            </div>
          )}
          <h2 className="text-xl font-bold text-white">{card.title}</h2>
          <p className="text-sm mt-1 italic" style={{ color: 'rgba(255,255,255,0.92)' }}>“{card.caption}”</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* The ending — a real written conclusion */}
          {card.epilogue && (
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--zymix-text-primary)' }}>
              {card.epilogue}
            </p>
          )}

          {/* The night's standout moment */}
          {highlight && (
            <div className="mb-5 rounded-xl p-3.5" style={{ background: t.accentSoft, borderLeft: `3px solid ${t.accent}` }}>
              <div className="text-xs font-semibold mb-1" style={{ color: t.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ✨ Highlight of the night
              </div>
              <div className="text-sm leading-snug" style={{ color: 'var(--zymix-text-primary)' }}>{highlight}</div>
            </div>
          )}

          {/* What you carried — nat-20 boons & nat-1 scars */}
          {card.marks && card.marks.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--zymix-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                What you carried
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

          {/* Turning points — the teammate events that changed the night (max 2) */}
          {topEvents.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--zymix-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Turning points
              </div>
              <div className="flex flex-col gap-1.5">
                {topEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--zymix-text-primary)' }}>
                    <span className="flex-shrink-0">{e.kind === 'boon' ? '🔀' : '💥'}</span>
                    <span className="leading-snug"><span className="font-semibold">{e.actorName} · {e.role}</span> — {e.line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run stats — MVP / crits, if any */}
          {card.best_interference && (
            <div className="mb-4 text-xs leading-relaxed rounded-xl px-3 py-2.5" style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-secondary)' }}>
              {card.best_interference}
            </div>
          )}

          {/* Final roll footer */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--zymix-divider)' }}>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--zymix-text-tertiary)' }}>
              🎲 Final roll <span className="font-bold" style={{ color: t.accent }}>{card.final_roll}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--zymix-text-secondary)' }}>{card.cta}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 px-4 flex flex-col gap-3 w-full max-w-sm">
        <button onClick={onShare} className="btn-zymix-primary">📤 Share Quest Card</button>
        <button onClick={onPlayAgain} className="py-3 rounded-full font-semibold" style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}>
          Play again 🔁
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
