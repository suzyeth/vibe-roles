/**
 * LobbyScreen — cold/dead group chat state.
 * The opening CTA lives INSIDE the chat as a message bubble from "Roll Call"
 * (with inline Yes/No), rather than a big bottom sheet — so it reads like the
 * bot just pinged a quiet group. Zymix-native, themed via CSS tokens.
 */
import { useState } from 'react';
import ChatAvatar from './ChatAvatar';

const TEXT = {
  separator: '3 days ago',
  quiet: 'No new messages for 3 days',
  quietPrompt: 'This group has been quiet for a while. Start a small adventure?',
  nudge: "No? In THIS group-chat economy? 😭 go on — one little quest.",
  yes: 'Yes',
  no: 'No',
};

const MESSAGES = [
  { id: 1, sender: 'Maya', initials: 'M', color: '#FF6B6B', text: 'anyone free tonight?', time: '3 days ago', isSelf: false },
  { id: 2, sender: 'Alex', initials: 'A', color: '#1DB954', text: 'maybe', time: '3 days ago', isSelf: true },
  { id: 3, sender: 'Kai', initials: 'K', color: '#45B7D1', text: '👀', time: '3 days ago', isSelf: false },
  { id: 4, sender: 'Zara', initials: 'Z', color: '#96CEB4', text: 'same', time: '3 days ago', isSelf: false },
];

export default function LobbyScreen({ onStart }: { onStart: () => void }) {
  const [nudged, setNudged] = useState(false);
  const DM = '#7C3AED';

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-y-auto">
        {/* Date separator */}
        <div className="flex items-center justify-center my-3">
          <span
            className="text-xs px-3 py-1"
            style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-tertiary)', borderRadius: '4px', border: '1px solid var(--zymix-border)' }}
          >
            {TEXT.separator}
          </span>
        </div>

        {/* The dead group chat */}
        {MESSAGES.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
            <ChatAvatar glyph={msg.initials} color={msg.isSelf ? '#1DB954' : msg.color} />
            <div className={`flex flex-col gap-0.5 max-w-[72%] ${msg.isSelf ? 'items-end' : 'items-start'}`}>
              {!msg.isSelf && (
                <span className="text-xs px-1 font-medium" style={{ color: msg.color }}>{msg.sender}</span>
              )}
              <div className={`${msg.isSelf ? 'bubble-sent' : 'bubble-received'} text-sm`}>{msg.text}</div>
              <span className="text-xs px-1" style={{ color: 'var(--zymix-text-tertiary)' }}>{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Dead silence indicator */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--zymix-text-tertiary)', animation: `pulse 2s ease-in-out ${i * 0.35}s infinite` }}
              />
            ))}
          </div>
          <span className="text-xs text-center" style={{ color: 'var(--zymix-text-tertiary)' }}>{TEXT.quiet}</span>
        </div>

        {/* Roll Call pings the quiet group — CTA lives in the chat */}
        <div className="flex items-end gap-2 mt-2 bubble-in">
          <ChatAvatar glyph="🎭" color={DM} />
          <div className="flex flex-col gap-2 max-w-[85%]">
            <span className="text-xs px-1 font-medium" style={{ color: DM }}>Roll Call</span>
            <div className="bubble-received text-sm">{TEXT.quietPrompt}</div>
            <div className="flex gap-2">
              <button
                onClick={onStart}
                className="px-5 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95"
                style={{ background: 'var(--zymix-green-light)', color: 'var(--zymix-green)', border: '1px solid var(--zymix-green)' }}
              >
                {TEXT.yes}
              </button>
              <button
                onClick={() => setNudged(true)}
                className="px-5 py-1.5 rounded-full text-xs font-medium transition-transform active:scale-95"
                style={{ background: 'var(--zymix-surface)', color: 'var(--zymix-text-secondary)', border: '1px solid var(--zymix-border)' }}
              >
                {TEXT.no}
              </button>
            </div>
          </div>
        </div>

        {/* Playful nudge if they tap No — keeps the chat feel, never dead-ends */}
        {nudged && (
          <div className="flex items-end gap-2 mt-1 bubble-in">
            <ChatAvatar glyph="🎭" color={DM} />
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className="bubble-received text-sm">{TEXT.nudge}</div>
              <button
                onClick={onStart}
                className="self-start px-5 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95"
                style={{ background: 'var(--zymix-green-light)', color: 'var(--zymix-green)', border: '1px solid var(--zymix-green)' }}
              >
                Fine, let&apos;s go 🎲
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
