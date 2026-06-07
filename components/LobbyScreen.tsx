/**
 * LobbyScreen — cold/dead group chat state
 * Zymix-native chat UI, themed via CSS tokens so it works in light AND dark.
 */
export default function LobbyScreen({
  onStart,
  testMode = true,
}: {
  onStart: () => void;
  testMode?: boolean;
}) {
  const TEXT = {
    separator: '3 days ago',
    quiet: 'No new messages for 3 days',
    title: 'Roll Call',
    subtitle: 'AI Group Drama · Mini App',
    free: 'Free',
    desc: 'Chat gone quiet? AI writes a 30-second drama for your group — everyone gets a role. No effort needed.',
    btn: 'Start Roll Call',
    note: 'Takes 2 minutes · Works best with 3–6 people',
    testLabel: 'Test Mode',
    testHint: 'Instant pre-written drama, no AI wait',
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--zymix-bg)' }}>
      {/* Chat messages area */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-1 overflow-y-auto">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: 'var(--zymix-border)' }} />
          <span className="text-xs px-2" style={{ color: 'var(--zymix-text-tertiary)' }}>{TEXT.separator}</span>
          <div className="flex-1 h-px" style={{ background: 'var(--zymix-border)' }} />
        </div>

        {[
          { id: 1, sender: 'Maya', initials: 'M', bg: '#FF6B6B', text: 'anyone free tonight?', time: '3 days ago', isSelf: false },
          { id: 2, sender: 'Alex', initials: 'A', bg: '#4ECDC4', text: 'maybe', time: '3 days ago', isSelf: true },
          { id: 3, sender: 'Kai', initials: 'K', bg: '#45B7D1', text: '👀', time: '3 days ago', isSelf: false },
          { id: 4, sender: 'Zara', initials: 'Z', bg: '#96CEB4', text: 'same', time: '3 days ago', isSelf: false },
        ].map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.isSelf ? 'flex-row-reverse' : ''}`}
          >
            {!msg.isSelf && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-4"
                style={{ background: msg.bg }}
              >
                {msg.initials}
              </div>
            )}
            <div className={`flex flex-col gap-0.5 max-w-[72%] ${msg.isSelf ? 'items-end' : 'items-start'}`}>
              {!msg.isSelf && (
                <span className="text-xs px-1 font-medium" style={{ color: 'var(--zymix-text-secondary)' }}>
                  {msg.sender}
                </span>
              )}
              <div
                className="px-3 py-2 text-sm"
                style={{
                  background: msg.isSelf ? 'var(--zymix-green)' : 'var(--zymix-surface)',
                  color: msg.isSelf ? '#FFFFFF' : 'var(--zymix-text-primary)',
                  borderRadius: '18px 18px 4px 18px',
                  boxShadow: msg.isSelf ? 'none' : 'var(--shadow-card)',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                }}
              >
                {msg.text}
              </div>
              <span className="text-xs px-1" style={{ color: 'var(--zymix-text-tertiary)' }}>{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Dead silence indicator */}
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'var(--zymix-text-tertiary)',
                  animation: `pulse 2s ease-in-out ${i * 0.35}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-center" style={{ color: 'var(--zymix-text-tertiary)' }}>
            {TEXT.quiet}
          </span>
        </div>
      </div>

      {/* Bottom CTA — Zymix Mini App sheet style */}
      <div className="zymix-sheet">
        <div className="zymix-sheet-handle" />

        {/* Mini App header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'var(--zymix-green-light)' }}
          >
            🎭
          </div>
          <div className="flex-1">
            <div className="font-bold text-base" style={{ color: 'var(--zymix-text-primary)' }}>{TEXT.title}</div>
            <div className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>{TEXT.subtitle}</div>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'var(--zymix-green-light)', color: 'var(--zymix-green)' }}
          >
            {TEXT.free}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--zymix-text-secondary)' }}>
          {TEXT.desc}
        </p>

        {/* Test Mode indicator (always enabled) */}
        <div
          className="w-full flex items-center justify-between mb-3 px-3 py-2 rounded-xl"
          style={{ background: 'var(--zymix-bg)', border: '1px solid var(--zymix-border)' }}
        >
          <span className="flex flex-col items-start">
            <span className="text-sm font-medium" style={{ color: 'var(--zymix-text-primary)' }}>🧪 {TEXT.testLabel}</span>
            <span className="text-xs" style={{ color: 'var(--zymix-text-tertiary)' }}>{TEXT.testHint}</span>
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--zymix-green)' }}>ON</span>
        </div>

        {/* CTA Button */}
        <button onClick={onStart} className="btn-zymix-primary">
          {TEXT.btn}
        </button>

        <p className="text-center text-xs mt-2" style={{ color: 'var(--zymix-text-tertiary)' }}>
          {TEXT.note}
        </p>
      </div>
    </div>
  );
}
