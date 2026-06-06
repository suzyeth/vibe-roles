export function MiniAppBar() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">💬</span>
        <div>
          <div className="text-sm font-bold leading-tight text-zinc-900">Flatmates (4)</div>
          <div className="text-[10px]" style={{ color: "#1DB954" }}>Zymix · Mini App</div>
        </div>
      </div>
      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: "#1DB954" }}>Roll Call</span>
    </header>
  );
}
