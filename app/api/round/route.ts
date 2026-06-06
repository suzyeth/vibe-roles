import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildRoundPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackRound } from "@/lib/fallback";
import { RoundSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { sceneSetup, roles, recentContext, seed } = await req.json();
  const list = Array.isArray(roles) ? roles : [];
  const s = typeof seed === "number" ? seed : 0;
  if (isOffline()) return Response.json(fallbackRound(list, s));
  try {
    const { system, user } = buildRoundPrompt(sceneSetup ?? "", list, recentContext ?? "");
    const round = RoundSchema.parse(await glmJSON(system, user));
    return Response.json(round);
  } catch {
    return Response.json(fallbackRound(list, s));
  }
}
