import type { DeadMsg } from "@/data/deadGroup";

export function DeadGroup({ msgs }: { msgs: DeadMsg[] }) {
  return (
    <div className="p-3 opacity-70">
      {msgs.map((m) => (
        <div key={m.id} className="my-2 flex gap-2">
          <span className="text-xl">{m.avatar}</span>
          <div>
            <div className="text-xs text-zinc-500">{m.author} · {m.time}</div>
            <div className="inline-block rounded-2xl bg-zinc-800 px-3 py-2 text-zinc-300">{m.text}</div>
          </div>
        </div>
      ))}
      <div className="mt-2 text-center text-xs text-zinc-600">— Seen. 3 days, nobody spoke. —</div>
    </div>
  );
}
