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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-zinc-950 p-5 text-zinc-100">
      <h1 className="text-xl font-bold">😈 Help or ruin this quest</h1>
      <p className="mt-1 text-sm text-zinc-400">Add a twist to your friend&apos;s quest. No app download needed.</p>

      {expired ? (
        <div className="mt-10 rounded-xl bg-zinc-900 p-6 text-center">
          <div className="text-4xl">🫥</div>
          <div className="mt-2 font-bold">This invitation has disappeared</div>
          <div className="mt-1 text-sm text-zinc-400">Time-limited invites last 5 minutes. Ask your friend to send a new one.</div>
          <div className="mt-5 text-xs text-zinc-500">
            Want your own quest? <a className="underline" href="/">Open Zymix · Vibe Roles</a>
          </div>
        </div>
      ) : !done ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-zinc-900 px-3 py-2 text-xs text-fuchsia-300">
            ⏳ This invitation disappears in {mm}:{ss}
            <div className="mt-1 h-1 w-full overflow-hidden rounded bg-zinc-800">
              <div className="h-1 rounded bg-fuchsia-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FATE_TYPE_LABELS.map((t) => (
              <button key={t.type} type="button" onClick={() => { setType(t.type); setInput(t.example); }}
                className={`rounded-full px-3 py-1 text-sm ${type === t.type ? "bg-fuchsia-600 text-white" : "bg-zinc-800"}`}>{t.label}</button>
            ))}
          </div>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="One line, e.g. An anonymous text arrives"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none" />
          <input value={friend} onChange={(e) => setFriend(e.target.value)} placeholder="Your name (optional)"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none" />
          <button type="button" onClick={submit} className="w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 py-2 font-semibold text-white">Submit twist ✨</button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-fuchsia-950/40 p-4">
          <div className="text-fuchsia-300">Added to the story:</div>
          <div className="mt-1 text-lg font-bold">{done.title}</div>
          <div className="text-sm opacity-90">{done.effect}</div>
          <div className="mt-4 text-xs text-zinc-400">Want your own quest? <a className="underline" href="/">Open Zymix · Vibe Roles</a></div>
        </div>
      )}
    </main>
  );
}
