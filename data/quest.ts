export const QUEST_THEMES = ["The Unread Beast", "Flat Heist", "Last Train Home", "Group Chat Trial"] as const;
export type QuestTheme = (typeof QUEST_THEMES)[number];
export const FATE_TYPE_LABELS: { type: string; label: string; example: string }[] = [
  { type: "character", label: "Add a Character", example: "A jealous duck" },
  { type: "object", label: "Add an Object", example: "A broken umbrella" },
  { type: "curse", label: "Add a Curse", example: "Everyone speaks in food metaphors" },
  { type: "rule", label: "Add a Rule", example: "Doors only open after bad advice" },
  { type: "blessing", label: "Add a Blessing", example: "One free escape" },
];
