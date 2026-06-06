import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { clampD20, rollLabel } from "@/lib/dice";
import { buildRollPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackRoundResult } from "@/lib/fallback";
import { getQuest, listFateCards, getStoryState, mergeStoryState } from "@/lib/questStore";
import { RoundResultSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { questId, roll, recent, round, active, action } = await req.json();
  const n = clampD20(typeof roll === "number" ? roll : 1);
  const label = rollLabel(n);
  const r = typeof round === "number" ? round : 0;
  const entry = questId ? getQuest(String(questId)) : undefined;
  const fate = questId ? listFateCards(String(questId)) : [];
  const setup = entry?.quest.scene.setup ?? "";
  const storyState = questId ? getStoryState(String(questId)) : undefined;
  const others = (entry?.quest.players ?? []).filter((p) => p.name !== "You");
  const reactors = others.length
    ? [others[r % others.length], others[(r + 1) % others.length]]
        .filter((x, i, a) => x && a.indexOf(x) === i)
        .map((p) => ({ name: p.name, role: p.role }))
    : [];
  const activePlayer = active?.name && active?.role ? { name: active.name, role: active.role } : undefined;
  if (isOffline()) {
    const fb = fallbackRoundResult(n, fate, reactors, r);
    if (questId) mergeStoryState(String(questId), fb.story_state_updates ?? {});
    return Response.json({ roll: n, label, narration: fb.narration, reactions: fb.reactions });
  }
  try {
    const { system, user } = buildRollPrompt(setup, label, fate, recent ?? "", reactors, activePlayer, action, storyState);
    const parsed = RoundResultSchema.parse(await glmJSON(system, user));
    if (questId) mergeStoryState(String(questId), parsed.story_state_updates ?? {});
    return Response.json({ roll: n, label, narration: parsed.narration, reactions: parsed.reactions });
  } catch {
    const fb = fallbackRoundResult(n, fate, reactors, r);
    return Response.json({ roll: n, label, narration: fb.narration, reactions: fb.reactions });
  }
}
