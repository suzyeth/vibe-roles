import { DICE_MAP } from "@/lib/dice";

// SPEC §5.3 exact colors + emoji, keyed by display label.
const BY_LABEL = Object.values(DICE_MAP).reduce<Record<string, { color: string; emoji: string }>>((acc, m) => {
  acc[m.label] = { color: m.color, emoji: m.emoji };
  return acc;
}, {});

export function RollResultBanner({ roll, label, advantage }: { roll: number; label: string; advantage?: boolean }) {
  const m = BY_LABEL[label];
  const bg = m?.color ?? "#3F3F46";
  // Partial Progress uses a yellow background → dark text for contrast
  const darkText = label === "Partial Progress";
  return (
    <div
      className="mx-3 my-2 rounded-xl px-3 py-2 text-center font-medium"
      style={{ backgroundColor: bg, color: darkText ? "#1A1A1A" : "#FFFFFF" }}
    >
      {m?.emoji ?? "🎲"} {roll} · <span className="font-bold">{label}</span>
      {advantage && <span className="ml-2 text-xs font-semibold">Advantage!</span>}
    </div>
  );
}
