"use client";
import { useRef, useState } from "react";
import { PRESET_MEMBERS } from "@/data/members";
import { DEAD_GROUP } from "@/data/deadGroup";
import { MiniAppBar } from "@/components/MiniAppBar";
import { DeadGroup } from "@/components/DeadGroup";
import { ThemePicker } from "@/components/ThemePicker";
import { RoleCardList } from "@/components/RoleCardList";
import { MessageBubble, type ChatMsg } from "@/components/MessageBubble";
import { Composer } from "@/components/Composer";
import { HighlightCard } from "@/components/HighlightCard";
import type { Scene, Highlight, Round } from "@/lib/schema";

type Phase = "cold" | "idle" | "loading" | "playing" | "ended";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [phase, setPhase] = useState<Phase>("cold");
  const [scene, setScene] = useState<Scene | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [posted, setPosted] = useState(false);
  const idRef = useRef(0);
  const transcriptRef = useRef<{ member: string; text: string }[]>([]);

  const nextId = () => `m${idRef.current++}`;
  const avatarOf = (name: string) => PRESET_MEMBERS.find((m) => m.name === name)?.avatar ?? "🎭";
  const myRole = scene?.roles.find((r) => r.member === "你")?.role ?? "";

  function pushMsg(author: string, text: string, kind: ChatMsg["kind"]) {
    setMsgs((m) => [...m, { id: nextId(), author, avatar: kind === "narration" ? "🎬" : avatarOf(author), text, kind }]);
  }
  function addTranscript(member: string, text: string) {
    transcriptRef.current = [...transcriptRef.current, { member, text }];
  }

  async function finish() {
    const res = await fetch("/api/highlight", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcriptRef.current }),
    });
    setHighlight(await res.json());
    setPhase("ended");
  }

  async function autoPlay(s: Scene) {
    const aiRoles = s.roles.filter((r) => PRESET_MEMBERS.find((m) => m.name === r.member)?.isAI);
    let recent = s.scene.setup;
    for (let round = 0; round < 2; round++) {
      const picks = [aiRoles[round % aiRoles.length], aiRoles[(round + 1) % aiRoles.length]].filter(Boolean);
      const roles = picks.map((r) => ({ member: r.member, role: r.role }));
      const res = await fetch("/api/round", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneSetup: s.scene.setup, roles, recentContext: recent, seed: round }),
      });
      const r: Round = await res.json();
      for (const ln of r.lines) {
        pushMsg(ln.member, ln.text, "member");
        addTranscript(ln.member, ln.text);
        await delay(750);
      }
      pushMsg("旁白", r.narration, "narration");
      recent = r.narration;
      await delay(750);
    }
    pushMsg("旁白", s.ending, "narration");
    await delay(600);
    await finish();
  }

  async function start(theme: string) {
    setPhase("loading"); setMsgs([]); setHighlight(null); setPosted(false);
    transcriptRef.current = [];
    const res = await fetch("/api/scene", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: PRESET_MEMBERS.map((m) => m.name), theme }),
    });
    const s: Scene = await res.json();
    setScene(s);
    setMsgs([{ id: nextId(), author: "旁白", avatar: "🎬", text: s.opening_narration, kind: "narration" }]);
    setPhase("playing");
    await autoPlay(s);
  }

  async function onSend(text: string) {
    pushMsg("你", text, "member");
    addTranscript("你", text);
    const res = await fetch("/api/narrate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneSetup: scene?.scene.setup, membersSaid: `你：${text}` }),
    });
    const { narration } = await res.json();
    pushMsg("旁白", narration, "narration");
  }

  return (
    <main className="mx-auto flex h-screen max-w-md flex-col bg-zinc-950 text-zinc-100">
      <MiniAppBar />
      <div className="flex-1 overflow-y-auto">
        {phase === "cold" && (
          <div>
            <DeadGroup msgs={DEAD_GROUP} />
            <div className="p-4 text-center">
              <button type="button" onClick={() => setPhase("idle")} className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg">✨ 群里好冷…用 Vibe Roles 救场</button>
            </div>
          </div>
        )}
        {phase === "idle" && <ThemePicker onPick={start} />}
        {phase === "loading" && <div className="p-8 text-center text-zinc-400">AI 正在选角…🎭</div>}
        {scene && (phase === "playing" || phase === "ended") && <RoleCardList roles={scene.roles} />}
        {msgs.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {phase === "ended" && highlight && (
          <div className="flex flex-col items-center pb-4">
            <HighlightCard h={highlight} />
            <button type="button" onClick={() => setPosted(true)} disabled={posted} className="mt-2 rounded-full bg-fuchsia-600 px-4 py-2 text-white disabled:opacity-60">
              {posted ? "已发到 Zymix 动态 ✨" : "📣 发到 Zymix 动态"}
            </button>
          </div>
        )}
      </div>
      {phase === "playing" && (
        <div>
          {myRole && <div className="px-3 pt-2 text-center text-xs text-fuchsia-300">你演【{myRole}】，照角色随时插一句</div>}
          <Composer onSend={onSend} />
          <button type="button" onClick={finish} className="mx-3 mb-3 rounded-full bg-indigo-600 py-2 text-white" style={{ width: "calc(100% - 1.5rem)" }}>⏭ 直接出名场面卡</button>
        </div>
      )}
      {phase === "ended" && (
        <button type="button" onClick={() => setPhase("idle")} className="m-3 rounded-full bg-fuchsia-600 py-2 text-white">再来一局 🔁</button>
      )}
    </main>
  );
}
