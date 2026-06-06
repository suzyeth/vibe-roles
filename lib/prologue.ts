import { z } from "zod";
import type { Quest } from "@/lib/schema";

export const PrologueSchema = z.object({ lines: z.array(z.string().min(1)).min(1) });
export type Prologue = z.infer<typeof PrologueSchema>;

/** Prompt for an AI-written opening prologue (3-4 short cinematic lines). */
export function buildProloguePrompt(quest: Quest) {
  const heroes = quest.players.map((p) => `${p.name} the ${p.role}`).join(", ");
  const system = `You are the host of "Vibe Dice". Write a short, punchy story PROLOGUE that opens the adventure, to be read out before the first dice roll.
Output JSON ONLY (no markdown): {"lines":["line 1","line 2","line 3"]}
Rules: 3-4 lines, each <=18 words, English, cinematic but Gen Z and funny, safe (no violence/explicit/hate). Set the scene, name the stakes, and end on a hook.`;
  const user = `Theme: ${quest.scene.theme}\nSetup: ${quest.scene.setup}\nGoal: ${quest.goal}\nHeroes: ${heroes}`;
  return { system, user };
}

/** Deterministic offline prologue derived from the quest (English). */
export function fallbackPrologue(quest: Quest): string[] {
  const names = quest.players.map((p) => p.name).join(", ");
  return [
    `${quest.scene.theme}.`,
    quest.scene.setup,
    `Our heroes — ${names} — have absolutely no idea what they just walked into.`,
    `The quest: ${quest.goal} Roll the die to begin.`,
  ];
}
