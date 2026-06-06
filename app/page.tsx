"use client";
import { useState } from "react";
import { PRESET_MEMBERS } from "@/data/members";
import { ThemePicker } from "@/components/ThemePicker";
import { RoleCardList } from "@/components/RoleCardList";
import { MessageBubble, type ChatMsg } from "@/components/MessageBubble";
import { Composer } from "@/components/Composer";
import { HighlightCard } from "@/components/HighlightCard";
import type { Scene, Highlight } from "@/lib/schema";

type Phase = "idle" | "loading" | "playing" | "ended";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scene, setScene] = useState<Scene | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [transcript, setTranscript] = useState<{ member: string; text: string }[]>([]);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const memberNames = PRESET_MEMBERS.map((m) => m.name);

  async function start(theme: string) {
    setPhase("loading"); setMsgs([]); setTranscript([]); setHighlight(null);
    const res = await fetch("/api/scene", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: memberNames, theme }),
    });
    const s: Scene = await res.json();
    setScene(s);
    setMsgs([{ id: "open", author: "旁白", avatar: "🎬", text: s.opening_narration, kind: "narration" }]);
    setPhase("playing");
  }

  async function onSend(text: string) {
    const next = [...transcript, { member: "你", text }];
    setTranscript(next);
    setMsgs((m) => [...m, { id: `u${m.length}`, author: "你", avatar: "🫵", text, kind: "member" }]);
    const res = await fetch("/api/narrate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneSetup: scene?.scene.setup, membersSaid: `你：${text}` }),
    });
    const { narration } = await res.json();
    setMsgs((m) => [...m, { id: `n${m.length}`, author: "旁白", avatar: "🎬", text: narration, kind: "narration" }]);
  }

  async function finish() {
    const res = await fetch("/api/highlight", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    setHighlight(await res.json());
    setPhase("ended");
  }

  return (
    <main className="mx-auto flex h-screen max-w-md flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 p-3 text-center font-bold">Zymix 群 · Vibe Roles</header>
      <div className="flex-1 overflow-y-auto">
        {phase === "idle" && <ThemePicker onPick={start} />}
        {phase === "loading" && <div className="p-8 text-center text-zinc-400">AI 正在选角…🎭</div>}
        {scene && phase !== "idle" && <RoleCardList roles={scene.roles} />}
        {msgs.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {phase === "ended" && highlight && <HighlightCard h={highlight} />}
      </div>
      {phase === "playing" && (
        <>
          <button
            onClick={() => onSend("(我潜水，AI 替我演)")}
            className="mx-3 mt-2 rounded-full border border-zinc-700 py-1 text-sm text-zinc-300"
          >😶 我潜水，让 AI 替我接一句</button>
          <Composer onSend={onSend} />
          <button onClick={finish} className="m-3 rounded-full bg-indigo-600 py-2 text-white">收尾 → 出名场面卡</button>
        </>
      )}
      {phase === "ended" && (
        <button onClick={() => setPhase("idle")} className="m-3 rounded-full bg-fuchsia-600 py-2 text-white">再来一局 🔁</button>
      )}
    </main>
  );
}
