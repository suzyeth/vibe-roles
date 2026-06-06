import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildQuestCardPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackQuestCard } from "@/lib/fallback";
import { QuestCardSchema } from "@/lib/schema";
import { listFateCards } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, finalRoll, summary } = await req.json();
  const n = typeof finalRoll === "number" ? finalRoll : 0;
  const titles = (questId ? listFateCards(String(questId)) : []).map((f) => f.title);
  const best = titles[titles.length - 1] ?? "—";
  if (isOffline()) return Response.json(fallbackQuestCard(n, best));
  try {
    const { system, user } = buildQuestCardPrompt(String(summary ?? ""), n, titles);
    return Response.json(QuestCardSchema.parse({ ...(await glmJSON(system, user) as object), final_roll: n }));
  } catch {
    return Response.json(fallbackQuestCard(n, best));
  }
}
