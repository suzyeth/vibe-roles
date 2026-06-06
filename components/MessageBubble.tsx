export type ChatMsg = { id: string; author: string; avatar: string; text: string; kind: "narration" | "member" };

export function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isNarration = msg.kind === "narration";
  return (
    <div className={`flex gap-2 my-2 ${isNarration ? "justify-center" : ""}`}>
      {!isNarration && <span className="text-xl">{msg.avatar}</span>}
      <div className={isNarration
        ? "text-sm italic text-purple-300 bg-purple-950/40 px-3 py-1 rounded-full"
        : "bg-zinc-800 text-zinc-100 px-3 py-2 rounded-2xl max-w-[75%]"}>
        {!isNarration && <div className="text-xs text-zinc-400">{msg.author}</div>}
        {msg.text}
      </div>
    </div>
  );
}
