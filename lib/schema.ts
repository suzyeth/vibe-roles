import { z } from "zod";

export const FATE_TYPES = ["event", "message", "character", "object", "rule", "condition"] as const;
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
  prologue: z.array(z.string()).optional(),
});
export type Quest = z.infer<typeof QuestSchema>;

export const PrologueSchema = z.object({ lines: z.array(z.string().min(1)).min(1).max(3) });
export type Prologue = z.infer<typeof PrologueSchema>;

export const ReactionSchema = z.object({ member: z.string().min(1), text: z.string().min(1) });
export type Reaction = z.infer<typeof ReactionSchema>;

export const ActionOptionsSchema = z.object({
  options: z.array(z.string().min(1)).min(1),
});
export type ActionOptions = z.infer<typeof ActionOptionsSchema>;

export const RoundResultSchema = z.object({
  narration: z.string().min(1),
  reactions: z.array(ReactionSchema).default([]),
  advance: z.boolean().default(true),
});
export type RoundResult = z.infer<typeof RoundResultSchema>;

export const QuestCardSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
  best_interference: z.string().min(1),
  final_roll: z.number().int(),
  cta: z.string().min(1),
});
export type QuestCard = z.infer<typeof QuestCardSchema>;
