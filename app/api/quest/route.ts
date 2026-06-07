import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildQuestPrompt, padWithNPCs } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackQuest, fallbackPrologue } from "@/lib/fallback";
import { QuestSchema, type Quest } from "@/lib/schema";
import { createQuest } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  let body: { questId?: string; members?: unknown; theme?: string } = {};
  try { body = await req.json(); } catch { /* malformed body → fall through to fallback */ }
  const { questId, members, theme } = body;
  let names: string[] = Array.isArray(members) ? (members as string[]) : [];
  // DESIGN.md §7.1: pad with NPCs to guarantee at least 3 roles
  names = padWithNPCs(names);
  let quest: Quest;
  if (isOffline()) quest = fallbackQuest(names, theme);
  else {
    try { const { system, user } = buildQuestPrompt(names, theme ?? ""); quest = QuestSchema.parse(await glmJSON(system, user)); }
    catch { quest = fallbackQuest(names, theme); }
  }
  // Prologue is derived instantly from the quest — no second (slow) GLM call on the critical path.
  const prologue = fallbackPrologue(quest);
  quest = { ...quest, prologue };
  if (questId) createQuest(String(questId), quest);
  return Response.json(quest);
}
