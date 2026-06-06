"use client";
import { useRef, useState } from "react";
import { PRESET_MEMBERS } from "@/data/members";
import { DEAD_GROUP } from "@/data/deadGroup";
import { QUEST_THEMES } from "@/data/quest";
import { MiniAppBar } from "@/components/MiniAppBar";
import { DeadGroup } from "@/components/DeadGroup";
import { MessageBubble, type ChatMsg } from "@/components/MessageBubble";
import { DiceRoller } from "@/components/DiceRoller";
import { RollResultBanner } from "@/components/RollResultBanner";
import { FateCardList } from "@/components/FateCardList";
import { QuestCard } from "@/components/QuestCard";
import type { Quest, FateCard, QuestCard as QC, Player } from "@/lib/schema";

type Phase = "cold" | "loading" | "choosing" | "rolling" | "playing" | "ended";
const TOTAL_ROUNDS = 3;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("cold");
  const [quest, setQuest] = useState<Quest | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [round, setRound] = useState(0);
  const [last, setLast] = useState<{ roll: number; label: string; advantage?: boolean } | null>(null);
  const [fate, setFate] = useState<FateCard[]>([]);
  const [card, setCard] = useState<QC | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState("");
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showDice, setShowDice] = useState(false);
  const [isCustomAction, setIsCustomAction] = useState(false);
  const idRef = useRef(0);
  const questId = useRef<string>("");
  const recent = useRef<string>("");

  const nextId = () => `m${idRef.current++}`;
  const shareUrl = typeof window !== "undefined" && questId.current ? `${window.location.origin}/q/${questId.current}` : "";
  function push(author: string, text: string, kind: ChatMsg["kind"]) {
    const avatar = kind === "narration" ? "🎬" : (PRESET_MEMBERS.find((m) => m.name === author)?.avatar ?? "🎲");
    setMsgs((m) => [...m, { id: nextId(), author, avatar, text, kind }]);
  }

  async function start(theme: string) {
    setPhase("loading"); setMsgs([]); setRound(0); setLast(null); setFate([]); setCard(null); setShowShare(false);
    setActionOptions([]); setCustomAction(""); setActivePlayer(null); setSelectedAction(null); setShowDice(false); setIsCustomAction(false);
    questId.current = `q_${idRef.current++}_${theme.length}`;
    const res = await fetch("/api/quest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, members: PRESET_MEMBERS.map((m) => m.name), theme }) });
    const q: Quest = await res.json();
    setQuest(q);
    setPhase("playing");
    // story prologue (generated with the quest): reveal the opening lines one by one before the first roll
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const lines = q.prologue && q.prologue.length ? q.prologue : [q.scene.setup];
    for (const line of lines) {
      push("Narrator", line, "narration");
      recent.current = line;
      await delay(700);
    }
    prepareRound();
  }

  function prepareRound() {
    if (!quest) return;
    const idx = round % quest.players.length;
    const active = quest.players[idx];
    setActivePlayer(active);
    setPhase("choosing");
    setSelectedAction(null);
    setShowDice(false);
    fetchActions();
  }

  async function fetchActions() {
    if (!quest || !activePlayer) return;
    try {
      const res = await fetch("/api/actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, recent: recent.current, active: { name: activePlayer.name, role: activePlayer.role }, seed: round }) });
      const data = await res.json();
      setActionOptions(data.options ?? []);
    } catch {
      setActionOptions(["Search the area", "Use your ability", "Take a bold move"]);
    }
  }

  async function chooseAction(action: string, isCustom = false) {
    if (!activePlayer) return;
    setPhase("rolling");
    setSelectedAction(action);
    setIsCustomAction(isCustom);
    push(activePlayer.name, action, "action");
    setShowDice(true);
  }

  async function onRoll(n: number, advantage?: boolean) {
    if (!selectedAction || !activePlayer) return;
    setPhase("playing");
    setActionOptions([]); setCustomAction(""); setSelectedAction(null); setShowDice(false); setIsCustomAction(false);
    // pull any friend interference submitted via the share link before resolving the roll
    try {
      const f = await (await fetch(`/api/fate?questId=${questId.current}`)).json();
      if (Array.isArray(f.cards)) setFate(f.cards);
    } catch { /* fate fetch is best-effort */ }
    const res = await fetch("/api/roll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, roll: n, recent: recent.current, round, active: { name: activePlayer.name, role: activePlayer.role }, action: selectedAction }) });
    const r = await res.json();
    setLast({ roll: r.roll, label: r.label, advantage });
    (r.reactions ?? []).forEach((rc: { member: string; text: string }) => push(rc.member, rc.text, "member"));
    push("Narrator", r.narration, "narration");
    recent.current = r.narration;
    const next = round + 1; setRound(next);
    if (next === 1) setShowShare(true);
    if (next >= TOTAL_ROUNDS) await finish(r.roll);
    else prepareRound();
  }

  async function finish(finalRoll: number) {
    const res = await fetch("/api/questcard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questId: questId.current, finalRoll, summary: recent.current }) });
    setCard(await res.json()); setPhase("ended");
  }

  return (
    <main className="mx-auto flex h-screen max-w-md flex-col bg-zinc-950 text-zinc-100">
      <MiniAppBar />
      <div className="flex-1 overflow-y-auto">
        {phase === "cold" && (
          <div>
            <DeadGroup msgs={DEAD_GROUP} />
            <div className="p-4 text-center">
              <div className="mb-2 text-zinc-300">This group&apos;s been quiet for a while. Start a mini adventure? 👇</div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUEST_THEMES.map((t) => (
                  <button key={t} type="button" onClick={() => start(t)} className="rounded-full bg-zinc-800 px-4 py-2 hover:bg-fuchsia-700">{t}</button>
                ))}
                <button type="button" onClick={() => start("")} className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 font-semibold">🎲 Roll to revive</button>
              </div>
            </div>
          </div>
        )}
        {phase === "loading" && <div className="p-8 text-center text-zinc-400">Rolling up your quest… 🎲</div>}
        {quest && phase !== "cold" && (
          <div className="grid grid-cols-2 gap-2 p-3">
            {quest.players.map((p) => (
              <div key={p.name} className={`rounded-xl p-3 text-white transition-all ${activePlayer?.name === p.name ? "bg-gradient-to-br from-fuchsia-500 to-indigo-500 ring-2 ring-fuchsia-400" : "bg-gradient-to-br from-fuchsia-700 to-indigo-700"}`}>
                <div className="text-xs opacity-80">{p.name}</div><div className="font-bold">{p.role}</div><div className="text-xs opacity-90">{p.ability}</div>
              </div>
            ))}
          </div>
        )}
        <FateCardList cards={fate} />
        {msgs.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {last && phase !== "choosing" && phase !== "rolling" && <RollResultBanner roll={last.roll} label={last.label} advantage={last.advantage} />}
        {phase === "ended" && card && <QuestCard card={card} />}
      </div>
      {phase === "choosing" && (
        <div className="border-t border-zinc-800 p-3">
          <div className="mb-2 text-center text-xs text-fuchsia-300">
            {activePlayer?.name}&apos;s turn · What do you do?
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {actionOptions.map((opt, i) => (
              <button key={i} type="button" onClick={() => chooseAction(opt)} className="rounded-lg bg-zinc-800 px-3 py-2 text-left text-sm hover:bg-fuchsia-700 transition-colors">
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Or type your own action…" value={customAction} onChange={(e) => setCustomAction(e.target.value)} className="flex-1 rounded bg-zinc-800 px-3 py-2 text-sm placeholder-zinc-500" />
            <button type="button" onClick={() => customAction && chooseAction(customAction, true)} disabled={!customAction.trim()} className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">Go</button>
          </div>
        </div>
      )}
      {showDice && phase === "rolling" && (
        <div className="border-t border-zinc-800 p-3">
          <div className="px-3 pt-2 text-center text-xs text-zinc-400">Rolling the die…</div>
          <DiceRoller onRoll={onRoll} advantage={isCustomAction} />
        </div>
      )}
      {phase === "playing" && (
        <div className="border-t border-zinc-800">
          <div className="px-3 pt-2 text-center text-xs text-zinc-400">Round {round + 1}/{TOTAL_ROUNDS} · tap the die to continue</div>
          <DiceRoller onRoll={onRoll} advantage={isCustomAction} />
          {showShare && shareUrl && (
            <div className="px-3 pb-3 text-center">
              <div className="text-xs text-fuchsia-300 mb-1">Let WhatsApp friends interfere with your quest:</div>
              <input readOnly value={shareUrl} className="w-full rounded bg-zinc-800 px-2 py-1 text-xs" onFocus={(e) => e.currentTarget.select()} />
              <a href={shareUrl} target="_blank" className="mt-1 inline-block text-xs underline text-fuchsia-400">Open interference page (demo)</a>
            </div>
          )}
        </div>
      )}
      {phase === "ended" && <button type="button" onClick={() => setPhase("cold")} className="m-3 rounded-full bg-fuchsia-600 py-2 text-white">Play again 🔁</button>}
    </main>
  );
}
