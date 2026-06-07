/**
 * ThemeScreen — pick your story (themed for light + dark)
 *
 * Shows the actual playable storylines (emoji + title + one-line hook) instead
 * of bare theme names, so picking a vibe really maps to the story that runs.
 */
import { useState } from 'react';
import { TEST_STORIES } from '@/data/testStories';

export default function ThemeScreen({ onSelect }: { onSelect: (theme: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const TEXT = { step: 'Step 1 of 3', title: 'Pick your story 🎭', desc: 'AI writes the script. You just show up.', random: '🎲 Surprise me' };

  const handleSelect = (theme: string) => {
    setSelected(theme);
    setTimeout(() => onSelect(theme), 300);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4" style={{ background: 'var(--zymix-surface)', borderBottom: '1px solid var(--zymix-divider)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-1.5 rounded-full" style={{ width: i === 1 ? '20px' : '8px', background: i === 1 ? 'var(--zymix-green)' : 'var(--zymix-border)' }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>{TEXT.step}</span>
        </div>
        <h1 className="text-xl font-bold mt-2" style={{ color: 'var(--zymix-text-primary)' }}>{TEXT.title}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--zymix-text-secondary)' }}>{TEXT.desc}</p>
      </div>

      {/* Story cards */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {TEST_STORIES.map((story, i) => {
          const isSelected = selected === story.theme;
          return (
            <button
              key={story.key}
              onClick={() => handleSelect(story.theme)}
              className="w-full text-left rounded-2xl transition-all duration-200 animate-slide-up opacity-0"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: 'forwards',
                background: 'var(--zymix-surface)',
                border: `2px solid ${isSelected ? 'var(--zymix-green)' : 'transparent'}`,
                boxShadow: isSelected ? '0 0 0 1px var(--zymix-green), var(--shadow-card)' : 'var(--shadow-card)',
                transform: isSelected ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--zymix-green-light)' }}>
                  {story.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base" style={{ color: 'var(--zymix-text-primary)' }}>{story.theme}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: 'var(--zymix-green)' }}>✓</div>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--zymix-text-tertiary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {story.setup}
                  </p>
                </div>
                <div className="flex-shrink-0 mt-1" style={{ color: isSelected ? 'var(--zymix-green)' : 'var(--zymix-text-tertiary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Random button */}
      <div className="px-4 pb-8 pt-2 animate-slide-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
        <button
          onClick={() => handleSelect(TEST_STORIES[Math.floor(Math.random() * TEST_STORIES.length)].theme)}
          className="w-full py-3.5 rounded-full font-semibold text-sm"
          style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}
        >
          {TEXT.random}
        </button>
      </div>
    </div>
  );
}
