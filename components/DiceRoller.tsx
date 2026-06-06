"use client";
import { useState } from "react";
export function DiceRoller({ onRoll, disabled }: { onRoll: (n: number) => void; disabled?: boolean }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(20);
  function roll() {
    if (disabled || rolling) return;
    setRolling(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 20)); ticks++;
      if (ticks > 10) { clearInterval(iv); const final = 1 + Math.floor(Math.random() * 20); setFace(final); setRolling(false); onRoll(final); }
    }, 60);
  }
  return (
    <button type="button" onClick={roll} disabled={disabled || rolling}
      className="mx-auto my-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-indigo-700 text-3xl font-extrabold text-white shadow-lg disabled:opacity-50">
      {rolling ? "🎲" : face}
    </button>
  );
}
