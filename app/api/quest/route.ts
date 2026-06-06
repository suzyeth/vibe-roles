import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildQuestPrompt, buildProloguePrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackQuest, fallbackPrologue } from "@/lib/fallback";
import { QuestSchema, PrologueSchema, type Quest } from "@/lib/schema";
import { createQuest } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  let body: { questId?: string; members?: unknown; theme?: string } = {};
  try { body = await req.json(); } catch { /* malformed body → fall through to fallback */ }
  const { questId, members, theme } = body;
  const names: string[] = Array.isArray(members) ? (members as string[]) : [];
  let quest: Quest;
  if (isOffline()) quest = fallbackQuest(names, theme);
  else {
    try { const { system, user } = buildQuestPrompt(names, theme ?? ""); quest = QuestSchema.parse(await glmJSON(system, user)); }
    catch { quest = fallbackQuest(names, theme); }
  }
  // opening prologue, revealed line-by-line on the client before the first roll
  let prologue: string[];
  if (isOffline()) prologue = fallbackPrologue(quest);
  else {
    try {
      const { system, user } = buildProloguePrompt(quest);
      const parsed = PrologueSchema.parse(await glmJSON(system, user));
      prologue = parsed.lines.length ? parsed.lines : fallbackPrologue(quest);
    } catch {
      prologue = fallbackPrologue(quest);
    }
  }
  quest = { ...quest, prologue };
  if (questId) createQuest(String(questId), quest);
  return Response.json(quest);
}
