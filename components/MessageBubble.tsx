export type ChatMsg = { id: string; author: string; avatar: string; text: string; kind: "narration" | "member" | "action" };

export function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.kind === "narration") {
    return (
      <div className="my-2 flex justify-center gap-2">
        <div className="rounded-full px-3 py-1 text-sm italic text-zinc-500" style={{ backgroundColor: "#F3F4F6" }}>{msg.text}</div>
      </div>
    );
  }
  if (msg.kind === "action") {
    return (
      <div className="my-2 flex gap-2">
        <span className="text-xl">{msg.avatar}</span>
        <div className="max-w-[75%] rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          <div className="text-xs text-amber-600">{msg.author} chose</div>
          ▸ {msg.text}
        </div>
      </div>
    );
  }
  // The human player's own messages: green, right-aligned (SPEC §5.4).
  if (msg.author === "You") {
    return (
      <div className="my-2 flex justify-end gap-2">
        <div className="max-w-[75%] rounded-2xl px-3 py-2 text-white" style={{ backgroundColor: "#1DB954" }}>{msg.text}</div>
      </div>
    );
  }
  // Other members: light grey, left-aligned.
  return (
    <div className="my-2 flex gap-2">
      <span className="text-xl">{msg.avatar}</span>
      <div className="max-w-[75%] rounded-2xl px-3 py-2 text-zinc-900" style={{ backgroundColor: "#F3F4F6" }}>
        <div className="text-xs text-zinc-500">{msg.author}</div>
        {msg.text}
      </div>
    </div>
  );
}
