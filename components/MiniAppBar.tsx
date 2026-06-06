export function MiniAppBar() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-fuchsia-700/30 to-indigo-700/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">💬</span>
        <div>
          <div className="text-sm font-bold leading-tight">舍友群 (4)</div>
          <div className="text-[10px] text-fuchsia-300">Zymix · Mini App</div>
        </div>
      </div>
      <span className="rounded-full bg-fuchsia-600/80 px-2 py-0.5 text-[10px] text-white">Vibe Roles</span>
    </header>
  );
}
