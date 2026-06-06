export type Member = { id: string; name: string; avatar: string; isAI: boolean };
/** 预置假 Zymix 成员；最后一个是"评委可输入"的真人位 */
export const PRESET_MEMBERS: Member[] = [
  { id: "m1", name: "小鹿", avatar: "🦌", isAI: true },
  { id: "m2", name: "阿K", avatar: "🧢", isAI: true },
  { id: "m3", name: "Momo", avatar: "🐱", isAI: true },
  { id: "you", name: "你", avatar: "🫵", isAI: false },
];
