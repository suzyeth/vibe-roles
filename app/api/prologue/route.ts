import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { glmJSON } from "@/lib/glm";
import { getQuest } from "@/lib/questStore";
import { buildProloguePrompt, fallbackPrologue, PrologueSchema } from "@/lib/prologue";

export async function POST(req: NextRequest) {
  const { questId } = await req.json();
  const entry = questId ? getQuest(String(questId)) : undefined;
  if (!entry) return Response.json({ lines: ["The adventure begins...", "Roll the die to find out how badly."] });
  const quest = entry.quest;
  if (isOffline()) return Response.json({ lines: fallbackPrologue(quest) });
  try {
    const { system, user } = buildProloguePrompt(quest);
    const parsed = PrologueSchema.parse(await glmJSON(system, user));
    return Response.json({ lines: parsed.lines.length ? parsed.lines : fallbackPrologue(quest) });
  } catch {
    return Response.json({ lines: fallbackPrologue(quest) });
  }
}
