"use client";
import { THEMES } from "@/data/themes";

export function ThemePicker({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="p-4 text-center">
      <div className="mb-3 text-zinc-300">群里有点冷？一键开一局 👇</div>
      <div className="flex flex-wrap justify-center gap-2">
        {THEMES.map((t) => (
          <button key={t} onClick={() => onPick(t)}
            className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-100 hover:bg-fuchsia-700">{t}</button>
        ))}
        <button onClick={() => onPick("")} className="rounded-full bg-fuchsia-600 px-4 py-2 text-white">🎲 随机</button>
      </div>
    </div>
  );
}
