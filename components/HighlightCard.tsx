"use client";
import { useRef } from "react";
import type { Highlight } from "@/lib/schema";
import { exportCardPng } from "@/lib/cardExport";

export function HighlightCard({ h }: { h: Highlight }) {
  const ref = useRef<HTMLDivElement>(null);
  async function save() {
    if (!ref.current) return;
    const url = await exportCardPng(ref.current);
    const a = document.createElement("a");
    a.href = url; a.download = "vibe-roles-card.png"; a.click();
  }
  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="my-4 w-72 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-700 p-5 text-white shadow-xl">
        <div className="text-xs uppercase tracking-widest opacity-80">{h.card_caption}</div>
        <div className="my-3 text-2xl font-extrabold leading-snug">“{h.line}”</div>
        <div className="text-sm opacity-90">— {h.member}</div>
        <div className="mt-4 text-right text-[10px] opacity-70">Vibe Roles · Zymix</div>
      </div>
      <button onClick={save} className="rounded-full bg-white/90 px-4 py-2 text-fuchsia-700 font-semibold">⬇️ 保存卡片去分享</button>
    </div>
  );
}
