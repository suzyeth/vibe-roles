"use client";
import { useState } from "react";

export function Composer({ onSend, disabled }: { onSend: (t: string) => void; disabled?: boolean }) {
  const [v, setV] = useState("");
  return (
    <form
      className="flex gap-2 p-3 border-t border-zinc-800"
      onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onSend(v.trim()); setV(""); } }}
    >
      <input
        className="flex-1 rounded-full bg-zinc-800 px-4 py-2 text-zinc-100 outline-none disabled:opacity-50"
        placeholder="照你的角色冒一句…" value={v} disabled={disabled}
        onChange={(e) => setV(e.target.value)}
      />
      <button className="rounded-full bg-fuchsia-600 px-4 py-2 text-white disabled:opacity-50" disabled={disabled}>发送</button>
    </form>
  );
}
