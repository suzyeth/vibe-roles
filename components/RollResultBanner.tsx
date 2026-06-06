const COLOR: Record<string, string> = {
  "Total Chaos": "bg-red-700", "Awkward Fail": "bg-orange-700", "Messy Progress": "bg-yellow-700",
  "Works Somehow": "bg-emerald-700", "Main Character Moment": "bg-fuchsia-700", "Iconic Roll": "bg-indigo-600",
};
export function RollResultBanner({ roll, label }: { roll: number; label: string }) {
  return (
    <div className={`mx-3 my-2 rounded-xl px-3 py-2 text-center text-white ${COLOR[label] ?? "bg-zinc-700"}`}>
      🎲 {roll} · <span className="font-bold">{label}</span>
    </div>
  );
}
