/**
 * ThemeScreen — pick your story (themed for light + dark).
 *
 * Driven directly by BRANCHING_STORIES so the card you pick is exactly the
 * story that runs (emoji, theme, hook, vibe all consistent), and selecting one
 * passes its real theme string straight to the engine.
 */
import { useState } from 'react';
import { BRANCHING_STORIES } from '@/data/branchingStories';
import { tint } from './ChatAvatar';

const TEXT = {
  title: 'Pick your story 🎭',
  desc: 'AI writes the script. You just show up.',
  random: '🎲 Surprise me',
};

/** A short vibe tag from the story's tone (e.g. "chaotic but harmless"). */
function vibe(tone: string): { icon: string; label: string } {
  const t = tone.toLowerCase();
  if (t.includes('tense') || t.includes('horror')) return { icon: '😰', label: 'Tense' };
  if (t.includes('roman') || t.includes('heart')) return { icon: '💘', label: 'Romance' };
  return { icon: '🌀', label: 'Chaotic' };
}

export default function ThemeScreen({ onSelect }: { onSelect: (theme: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (theme: string) => {
    setSelected(theme);
    setTimeout(() => onSelect(theme), 280);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4" style={{ background: 'var(--zymix-surface)', borderBottom: '1px solid var(--zymix-border)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--zymix-text-primary)' }}>{TEXT.title}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--zymix-text-secondary)' }}>{TEXT.desc}</p>
      </div>

      {/* Story cards */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {BRANCHING_STORIES.map((story, i) => {
          const isSelected = selected === story.theme;
          const v = vibe(story.tone);
          const a = story.accent;
          return (
            <button
              key={story.key}
              onClick={() => handleSelect(story.theme)}
              className="w-full text-left rounded-2xl transition-all duration-200 animate-slide-up opacity-0 active:scale-[0.99]"
              style={{
                animationDelay: `${i * 70}ms`,
                animationFillMode: 'forwards',
                background: 'var(--zymix-surface)',
                border: `2px solid ${isSelected ? a : 'var(--zymix-border)'}`,
                boxShadow: isSelected ? `0 0 0 3px ${tint(a)}` : '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-stretch gap-3 p-4">
                {/* Accent spine */}
                <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ background: a, opacity: 0.85 }} />
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${tint(a)}, ${a}14)`, boxShadow: `inset 0 0 0 1px ${a}40` }}
                >
                  {story.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base" style={{ color: 'var(--zymix-text-primary)' }}>{story.theme}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: a }}>✓</span>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--zymix-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {story.setup}
                  </p>
                  {/* Vibe + cast tags */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tint(a), color: a }}>
                      {v.icon} {v.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-tertiary)' }}>
                      🎭 {Object.keys(story.roles).length} roles
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 self-center" style={{ color: a }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Random button */}
      <div className="px-4 pb-8 pt-2 animate-slide-up opacity-0" style={{ animationDelay: '380ms', animationFillMode: 'forwards' }}>
        <button
          onClick={() => handleSelect(BRANCHING_STORIES[Math.floor(Math.random() * BRANCHING_STORIES.length)].theme)}
          className="w-full py-3.5 rounded-full font-semibold text-sm active:scale-[0.99] transition-transform"
          style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}
        >
          {TEXT.random}
        </button>
      </div>
    </div>
  );
}
