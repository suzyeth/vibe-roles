import type { FateCard } from "@/lib/schema";
export function FateCardList({ cards }: { cards: FateCard[] }) {
  if (!cards.length) return null;
  return (
    <div className="mx-3 my-2 space-y-1">
      {cards.map((c, i) => (
        <div key={i} className="rounded-lg border border-fuchsia-700/50 bg-fuchsia-950/30 px-3 py-1 text-sm">
          <span className="text-fuchsia-300">[{c.type}]</span> <b>{c.title}</b> — {c.effect}
          {c.source_friend && <span className="text-xs text-zinc-400"> · by {c.source_friend}</span>}
        </div>
      ))}
    </div>
  );
}
