"use client";
import { useRef } from "react";
import type { QuestCard as QC } from "@/lib/schema";
import { exportCardPng } from "@/lib/cardExport";
export function QuestCard({ card }: { card: QC }) {
  const ref = useRef<HTMLDivElement>(null);
  async function save() {
    if (!ref.current) return;
    const url = await exportCardPng(ref.current);
    const a = document.createElement("a"); a.href = url; a.download = "roll-call-card.png"; a.click();
  }
  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="my-4 w-72 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-700 p-5 text-white shadow-xl">
        <div className="text-xs uppercase tracking-widest opacity-80">{card.title}</div>
        <div className="my-2 text-2xl font-extrabold">🎲 {card.final_roll} · {card.caption}</div>
        <div className="text-sm opacity-90">Best Interference: {card.best_interference}</div>
        <div className="mt-3 text-xs opacity-80">{card.cta}</div>
        <div className="mt-2 text-right text-[10px] opacity-70">Roll Call · Zymix</div>
      </div>
      <button type="button" onClick={save} className="rounded-full bg-white/90 px-4 py-2 font-semibold text-fuchsia-700">⬇️ Save Quest Card</button>
    </div>
  );
}
