export const THEMES = ["宿舍悬案", "综艺现场", "飞船危机", "八卦法庭"] as const;
export type Theme = (typeof THEMES)[number];
