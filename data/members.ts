export type Member = { id: string; name: string; avatar: string; isAI: boolean };
export const PRESET_MEMBERS: Member[] = [
  { id: "m1", name: "Mia", avatar: "🦌", isAI: true },
  { id: "m2", name: "Kai", avatar: "🧢", isAI: true },
  { id: "m3", name: "Momo", avatar: "🐱", isAI: true },
  { id: "you", name: "You", avatar: "🫵", isAI: false },
];
