"use client";
import { useState } from "react";
export function DiceRoller({ onRoll, disabled, advantage }: { onRoll: (n: number, _advantage?: boolean) => void; disabled?: boolean; advantage?: boolean }) {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(20);
  const [showAdvantage, setShowAdvantage] = useState(false);
  function roll() {
    if (disabled || rolling) return;
    setRolling(true);
    setShowAdvantage(!!advantage);
    let ticks = 0;
    const iv = setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 20)); ticks++;
      if (ticks > 10) {
        clearInterval(iv);
        const r1 = 1 + Math.floor(Math.random() * 20);
        const final = advantage ? Math.max(r1, 1 + Math.floor(Math.random() * 20)) : r1;
        setFace(final);
        setRolling(false);
        onRoll(final, advantage);
      }
    }, 60);
  }
  return (
    <div className="flex flex-col items-center">
      {showAdvantage && !rolling && <div className="mb-1 text-xs text-fuchsia-300 font-semibold">Advantage! (roll twice, keep higher)</div>}
      <button type="button" onClick={roll} disabled={disabled || rolling}
        className={`mx-auto my-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl font-extrabold text-white shadow-lg disabled:opacity-50 ${advantage ? "from-amber-500 to-orange-600" : "from-fuchsia-600 to-indigo-700"}`}>
        {rolling ? "🎲" : face}
      </button>
    </div>
  );
}
