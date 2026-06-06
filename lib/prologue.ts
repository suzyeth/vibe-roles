import { z } from "zod";
import type { Quest } from "@/lib/schema";

export const PrologueSchema = z.object({ lines: z.array(z.string().min(1)).min(1) });
export type Prologue = z.infer<typeof PrologueSchema>;

/** Prompt for an AI-written opening prologue (3-4 short cinematic lines). */
export function buildProloguePrompt(quest: Quest) {
  const heroes = quest.players.map((p) => `${p.name} the ${p.role}`).join(", ");
  const system = `You are the Game Master of "Vibe Dice". Write a THRILLING story PROLOGUE that opens the adventure, read out before the first dice roll.
Output JSON ONLY (no markdown): {"lines":["line 1","line 2","line 3","line 4"]}
Rules: 4-5 lines, each <=22 words, English, cinematic and high-stakes — build tension, name the danger, give each hero a beat — Gen Z and witty, safe (no violence/explicit/hate). End on a cliffhanger that makes them want to roll.`;
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
