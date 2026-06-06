import { z } from "zod";

export const RoleSchema = z.object({
  member: z.string().min(1),
  role: z.string().min(1),
  hook: z.string().min(1),
});

export const BeatSchema = z.object({ narration: z.string().min(1) });

export const SceneSchema = z.object({
  scene: z.object({ theme: z.string().min(1), setup: z.string().min(1) }),
  roles: z.array(RoleSchema).min(1),
  opening_narration: z.string().min(1),
  beats: z.array(BeatSchema),
  ending: z.string().min(1),
});

export type Scene = z.infer<typeof SceneSchema>;
export type Role = z.infer<typeof RoleSchema>;

export const HighlightSchema = z.object({
  member: z.string().min(1),
  line: z.string().min(1),
  card_caption: z.string().min(1),
});

export type Highlight = z.infer<typeof HighlightSchema>;

export const RoundLineSchema = z.object({
  member: z.string().min(1),
  role: z.string().min(1),
  text: z.string().min(1),
});

export const RoundSchema = z.object({
  lines: z.array(RoundLineSchema).min(1),
  narration: z.string().min(1),
});

export type Round = z.infer<typeof RoundSchema>;
