import type { FateCard } from "@/lib/schema";
export function FateCardList({ cards }: { cards: FateCard[] }) {
  if (!cards.length) return null;
  return (
    <div className="mx-3 my-2 space-y-1">
      {cards.map((c, i) => (
        <div key={i} className="rounded-lg border px-3 py-1 text-sm" style={{ backgroundColor: "#EDE9FE", borderColor: "#7C3AED", color: "#5B21B6" }}>
          <span style={{ color: "#7C3AED" }}>[{c.type}]</span> <b>{c.title}</b> — {c.effect}
          {c.source_friend && <span className="text-xs text-zinc-500"> · by {c.source_friend}</span>}
        </div>
      ))}
    </div>
  );
}
