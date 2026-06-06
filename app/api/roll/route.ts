import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { clampD20, rollLabel } from "@/lib/dice";
import { buildRollPrompt } from "@/lib/director";
import { glmText } from "@/lib/glm";
import { fallbackRoundResult } from "@/lib/fallback";
import { getQuest, listFateCards } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, roll, recent } = await req.json();
  const n = clampD20(typeof roll === "number" ? roll : 1);
  const label = rollLabel(n);
  const entry = questId ? getQuest(String(questId)) : undefined;
  const fate = questId ? listFateCards(String(questId)) : [];
  const setup = entry?.quest.scene.setup ?? "";
  if (isOffline()) return Response.json({ roll: n, label, narration: fallbackRoundResult(n, fate).narration });
  try {
    const { system, user } = buildRollPrompt(setup, label, fate, recent ?? "");
    const narration = (await glmText(system, user)).trim();
    return Response.json({ roll: n, label, narration: narration || fallbackRoundResult(n, fate).narration });
  } catch {
    return Response.json({ roll: n, label, narration: fallbackRoundResult(n, fate).narration });
  }
}
