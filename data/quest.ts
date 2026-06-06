export const QUEST_THEMES = ["The 404 Customer", "Space Station SOS", "Last Train Home", "Dorm Kitchen Mystery"] as const;
export type QuestTheme = (typeof QUEST_THEMES)[number];
export const FATE_TYPE_LABELS: { type: string; label: string; example: string }[] = [
  { type: "event", label: "Add an Event", example: "An alarm suddenly blares" },
  { type: "message", label: "Add a Message", example: "An anonymous text arrives" },
  { type: "character", label: "Add a Character", example: "The 404th customer appears" },
  { type: "object", label: "Add an Object", example: "A key that opens no door" },
  { type: "rule", label: "Add a Rule", example: "Doors auto-lock when someone lies" },
  { type: "condition", label: "Add a Condition", example: "Leave the room within 5 minutes" },
];
