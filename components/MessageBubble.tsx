export type ChatMsg = { id: string; author: string; avatar: string; text: string; kind: "narration" | "member" | "action" };

export function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.kind === "narration") {
    return (
      <div className="my-2 flex justify-center gap-2">
        <div className="rounded-full bg-purple-950/40 px-3 py-1 text-sm italic text-purple-300">{msg.text}</div>
      </div>
    );
  }
  if (msg.kind === "action") {
    return (
      <div className="my-2 flex gap-2">
        <span className="text-xl">{msg.avatar}</span>
        <div className="max-w-[75%] rounded-2xl border border-amber-500/50 bg-amber-600/20 px-3 py-2 text-amber-100">
          <div className="text-xs text-amber-300/80">{msg.author} chose</div>
          ▸ {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="my-2 flex gap-2">
      <span className="text-xl">{msg.avatar}</span>
      <div className="max-w-[75%] rounded-2xl bg-zinc-800 px-3 py-2 text-zinc-100">
        <div className="text-xs text-zinc-400">{msg.author}</div>
        {msg.text}
      </div>
    </div>
  );
}
