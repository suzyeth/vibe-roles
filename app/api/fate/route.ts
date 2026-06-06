import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildFateCardPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackFateCard } from "@/lib/fallback";
import { FateCardSchema, FATE_TYPES } from "@/lib/schema";
import { addFateCard, listFateCards } from "@/lib/questStore";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("questId") ?? "";
  return Response.json({ cards: listFateCards(id) });
}

export async function POST(req: NextRequest) {
  let body: { questId?: string; type?: string; input?: string; friend?: string } = {};
  try { body = await req.json(); } catch { /* malformed body → fallback fate card */ }
  const { questId, type, input, friend } = body;
  const t = typeof type === "string" ? type : "";
  const safeType = ((FATE_TYPES as readonly string[]).includes(t) ? t : "event") as (typeof FATE_TYPES)[number];
  let card;
  if (isOffline()) card = fallbackFateCard(String(input ?? ""), 0);
  else {
    try { const { system, user } = buildFateCardPrompt(safeType, String(input ?? "")); card = FateCardSchema.parse({ ...(await glmJSON(system, user) as object), type: safeType }); }
    catch { card = fallbackFateCard(String(input ?? ""), 0); }
  }
  card = { ...card, type: safeType, source_friend: friend ? String(friend) : undefined };
  if (questId) addFateCard(String(questId), card);
  return Response.json(card);
}
