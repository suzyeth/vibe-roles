import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildQuestPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackQuest } from "@/lib/fallback";
import { QuestSchema } from "@/lib/schema";
import { createQuest } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, members, theme } = await req.json();
  const names: string[] = Array.isArray(members) ? members : [];
  let quest;
  if (isOffline()) quest = fallbackQuest(names);
  else {
    try { const { system, user } = buildQuestPrompt(names, theme); quest = QuestSchema.parse(await glmJSON(system, user)); }
    catch { quest = fallbackQuest(names); }
  }
  if (questId) createQuest(String(questId), quest);
  return Response.json(quest);
}
