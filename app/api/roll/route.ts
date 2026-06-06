import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { clampD20, rollLabel } from "@/lib/dice";
import { buildRollPrompt, buildPartyPrompt } from "@/lib/director";
import { glmText, glmJSON } from "@/lib/glm";
import { fallbackRoundResult, fallbackPartyLines } from "@/lib/fallback";
import { PartyLinesSchema } from "@/lib/schema";
import { getQuest, listFateCards } from "@/lib/questStore";

export async function POST(req: NextRequest) {
  const { questId, roll, recent } = await req.json();
  const n = clampD20(typeof roll === "number" ? roll : 1);
  const label = rollLabel(n);
  const entry = questId ? getQuest(String(questId)) : undefined;
  const fate = questId ? listFateCards(String(questId)) : [];
  const setup = entry?.quest.scene.setup ?? "";
  // party = the AI teammates (everyone in the quest except the human "你")
  const party = (entry?.quest.players ?? []).map((p) => p.name).filter((nm) => nm !== "你");

  let narration: string;
  let lines: { name: string; text: string }[];
  if (isOffline()) {
    narration = fallbackRoundResult(n, fate).narration;
    lines = fallbackPartyLines(party, label, n);
  } else {
    try {
      const { system, user } = buildRollPrompt(setup, label, fate, recent ?? "");
      narration = (await glmText(system, user)).trim() || fallbackRoundResult(n, fate).narration;
    } catch {
      narration = fallbackRoundResult(n, fate).narration;
    }
    try {
      const { system, user } = buildPartyPrompt(party, setup, label, recent ?? "");
      const parsed = PartyLinesSchema.parse(await glmJSON(system, user));
      lines = parsed.lines.length ? parsed.lines : fallbackPartyLines(party, label, n);
    } catch {
      lines = fallbackPartyLines(party, label, n);
    }
  }
  return Response.json({ roll: n, label, narration, lines });
}
