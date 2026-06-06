import { z } from "zod";

export const FATE_TYPES = ["character", "object", "curse", "rule", "blessing"] as const;
export const FateCardSchema = z.object({
  type: z.enum(FATE_TYPES),
  title: z.string().min(1),
  effect: z.string().min(1),
  tone: z.string().min(1).default("chaotic but harmless"),
  trigger: z.string().min(1).default("next_round"),
  source_friend: z.string().optional(),
});
export type FateCard = z.infer<typeof FateCardSchema>;

export const PlayerSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  ability: z.string().min(1),
  status: z.enum(["active", "sleeping_npc", "npc"]).default("active"),
});
export type Player = z.infer<typeof PlayerSchema>;

export const QuestSchema = z.object({
  scene: z.object({ theme: z.string().min(1), setup: z.string().min(1), tone: z.string().min(1) }),
  players: z.array(PlayerSchema).min(1),
  goal: z.string().min(1),
});
export type Quest = z.infer<typeof QuestSchema>;

export const RoundResultSchema = z.object({ narration: z.string().min(1), advance: z.boolean().default(true) });
export type RoundResult = z.infer<typeof RoundResultSchema>;

export const QuestCardSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
  best_interference: z.string().min(1),
  final_roll: z.number().int(),
  cta: z.string().min(1),
});
export type QuestCard = z.infer<typeof QuestCardSchema>;
