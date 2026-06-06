"use client";
import { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import LobbyScreen from '@/components/LobbyScreen';
import ThemeScreen from '@/components/ThemeScreen';
import PlayingScreen from '@/components/PlayingScreen';
import EndingCard from '@/components/EndingCard';
import { PRESET_MEMBERS } from '@/data/members';

export default function Home() {
  const game = useGameState();
  const { state, startQuest } = game;
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Restore saved theme on mount; apply to <html data-theme> + persist on change.
  useEffect(() => {
    const saved = (typeof window !== 'undefined' ? localStorage.getItem('rc-theme') : null) as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') localStorage.setItem('rc-theme', theme);
  }, [theme]);

  const handleStart = () => {
    game.setPhase('theme');
  };

  const handleSelectTheme = (selectedTheme: string) => {
    startQuest(PRESET_MEMBERS.map(m => m.name), selectedTheme);
  };

  const handlePlayAgain = () => {
    game.resetGame();
  };

  const handleShare = () => {
    if (state.shareUrl) {
      navigator.clipboard.writeText(state.shareUrl);
      alert('链接已复制！');
    }
  };

  return (
    <main className="mx-auto flex h-screen flex-col max-w-md">
      {/* Zymix-style top navigation bar */}
      <div className="zymix-navbar">
        {/* Left: back arrow + group name */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => state.phase !== 'lobby' && game.resetGame()}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{
              color: 'var(--zymix-green)',
              background: state.phase !== 'lobby' ? 'var(--zymix-green-light)' : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight" style={{ color: 'var(--zymix-text-primary)' }}>
              UCL Flat 4B 🏠
            </span>
            <span className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>{PRESET_MEMBERS.length} members</span>
          </div>
        </div>

        {/* Center: Roll Call badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: 'var(--zymix-green-light)' }}
        >
          <span className="text-base">🎭</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--zymix-green)' }}>Roll Call</span>
        </div>

        {/* Right: theme + language toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
            style={{ background: 'var(--zymix-bg)' }}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--zymix-bg)', color: 'var(--zymix-text-secondary)' }}
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1" style={{ background: 'var(--zymix-bg)' }}>
        {state.phase === 'lobby' && (
          <LobbyScreen
            onStart={handleStart}
            lang={lang}
            testMode={game.testMode}
            onToggleTestMode={() => game.setTestMode(!game.testMode)}
          />
        )}
        {state.phase === 'theme' && (
          <ThemeScreen
            onSelect={handleSelectTheme}
            lang={lang}
          />
        )}
        {state.phase === 'loading' && (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--zymix-text-tertiary)' }}>
            <div className="text-center">
              <div className="text-3xl mb-2">🎲</div>
              <div className="text-sm">{lang === 'zh' ? '正在生成冒险…' : 'Rolling up your quest…'}</div>
            </div>
          </div>
        )}
        {state.phase === 'playing' && (
          <PlayingScreen game={game} />
        )}
        {state.phase === 'ended' && (
          <EndingCard
            card={state.questCard}
            onPlayAgain={handlePlayAgain}
            onShare={handleShare}
          />
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-6" />
    </main>
  );
}