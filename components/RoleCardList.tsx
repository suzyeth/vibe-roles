import type { Role } from "@/lib/schema";

export function RoleCardList({ roles }: { roles: Role[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {roles.map((r) => (
        <div key={r.member} className="bg-gradient-to-br from-fuchsia-700 to-indigo-700 rounded-xl p-3 text-white">
          <div className="text-xs opacity-80">{r.member}</div>
          <div className="text-lg font-bold">{r.role}</div>
          <div className="text-xs mt-1 opacity-90">{r.hook}</div>
        </div>
      ))}
    </div>
  );
}
