export const QUEST_THEMES = ["The Unread Beast", "Flat Heist", "Last Train Home", "Group Chat Trial"] as const;
export type QuestTheme = (typeof QUEST_THEMES)[number];
export const FATE_TYPE_LABELS: { type: string; label: string; example: string }[] = [
  { type: "character", label: "加角色", example: "A jealous duck" },
  { type: "object", label: "加道具", example: "A broken umbrella" },
  { type: "curse", label: "加诅咒", example: "Everyone speaks in food metaphors" },
  { type: "rule", label: "加规则", example: "Doors only open after bad advice" },
  { type: "blessing", label: "加祝福", example: "One free escape" },
];
