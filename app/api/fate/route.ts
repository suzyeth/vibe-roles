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
  const { questId, type, input, friend } = await req.json();
  const safeType = (FATE_TYPES as readonly string[]).includes(type) ? type : "curse";
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
