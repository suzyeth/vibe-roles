"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FATE_TYPE_LABELS } from "@/data/quest";

const WINDOW_MS = 5 * 60 * 1000; // SPEC §5: 5-minute disappearing invite

export default function InterferePage() {
  const params = useParams<{ id: string }>();
  const startRef = useRef<number>(0);
  const [remaining, setRemaining] = useState(WINDOW_MS);
  const [type, setType] = useState(FATE_TYPE_LABELS[0]?.type ?? "event");
  const [input, setInput] = useState("");
  const [friend, setFriend] = useState("");
  const [done, setDone] = useState<null | { title: string; effect: string }>(null);

  // Match the player's saved light/dark theme (defaults to light if unset).
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("rc-theme") : null;
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  }, []);

  // Countdown starts when the friend opens the invite (demo approximation of "5 min from creation").
  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => setRemaining(Math.max(0, startRef.current + WINDOW_MS - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const expired = remaining <= 0 && !done;
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");
  const pct = Math.max(0, Math.round((remaining / WINDOW_MS) * 100));

  async function submit() {
    if (!input.trim() || expired) return;
    const res = await fetch("/api/fate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId: params.id, type, input: input.trim(), friend: friend.trim() || undefined }),
    });
    const card = await res.json();
    setDone({ title: card.title, effect: card.effect });
  }

  const surface = { background: "var(--zymix-surface)", border: "1px solid var(--zymix-border)" };
  const inputStyle = { background: "var(--zymix-bg)", color: "var(--zymix-text-primary)", border: "1px solid var(--zymix-border)" };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-5" style={{ background: "var(--zymix-bg)", color: "var(--zymix-text-primary)" }}>
      <h1 className="text-xl font-bold">😈 Help or ruin this quest</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--zymix-text-secondary)" }}>Add a twist to your friend&apos;s quest. No app download needed.</p>

      {expired ? (
        <div className="mt-10 rounded-xl p-6 text-center" style={surface}>
          <div className="text-4xl">🫥</div>
          <div className="mt-2 font-bold">This invitation has disappeared</div>
          <div className="mt-1 text-sm" style={{ color: "var(--zymix-text-secondary)" }}>Time-limited invites last 5 minutes. Ask your friend to send a new one.</div>
          <div className="mt-5 text-xs" style={{ color: "var(--zymix-text-tertiary)" }}>
            Want your own quest? <a className="underline" style={{ color: "var(--zymix-green)" }} href="/">Open Zymix · Roll Call</a>
          </div>
        </div>
      ) : !done ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--zymix-fate-light)", color: "var(--zymix-fate)" }}>
            ⏳ This invitation disappears in {mm}:{ss}
            <div className="mt-1 h-1 w-full overflow-hidden rounded" style={{ background: "var(--zymix-border)" }}>
              <div className="h-1 rounded transition-all duration-1000" style={{ width: `${pct}%`, background: "var(--zymix-fate)" }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FATE_TYPE_LABELS.map((t) => {
              const active = type === t.type;
              return (
                <button key={t.type} type="button" onClick={() => { setType(t.type); setInput(t.example); }}
                  className="rounded-full px-3 py-1 text-sm"
                  style={active
                    ? { background: "var(--zymix-fate)", color: "#fff" }
                    : { background: "var(--zymix-surface)", color: "var(--zymix-text-secondary)", border: "1px solid var(--zymix-border)" }}>
                  {t.label}
                </button>
              );
            })}
          </div>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="One line, e.g. An anonymous text arrives"
            className="w-full rounded-lg px-3 py-2 outline-none" style={inputStyle} />
          <input value={friend} onChange={(e) => setFriend(e.target.value)} placeholder="Your name (optional)"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          <button type="button" onClick={submit} className="w-full rounded-full py-2 font-semibold text-white" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>Submit twist ✨</button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl p-4" style={{ background: "var(--zymix-fate-light)", border: "1px solid var(--zymix-fate)" }}>
          <div style={{ color: "var(--zymix-fate)" }}>Added to the story:</div>
          <div className="mt-1 text-lg font-bold" style={{ color: "var(--zymix-text-primary)" }}>{done.title}</div>
          <div className="text-sm" style={{ color: "var(--zymix-text-secondary)" }}>{done.effect}</div>
          <div className="mt-4 text-xs" style={{ color: "var(--zymix-text-tertiary)" }}>Want your own quest? <a className="underline" style={{ color: "var(--zymix-green)" }} href="/">Open Zymix · Roll Call</a></div>
        </div>
      )}
    </main>
  );
}
