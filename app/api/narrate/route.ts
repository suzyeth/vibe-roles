import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildNarratePrompt } from "@/lib/director";
import { glmText } from "@/lib/glm";
import { fallbackNarration } from "@/lib/fallback";

export async function POST(req: NextRequest) {
  const { sceneSetup, membersSaid } = await req.json();
  if (isOffline()) return Response.json({ narration: fallbackNarration(membersSaid) });
  try {
    const { system, user } = buildNarratePrompt(sceneSetup ?? "", membersSaid ?? "");
    const narration = (await glmText(system, user)).trim();
    return Response.json({ narration: narration || fallbackNarration(membersSaid) });
  } catch {
    return Response.json({ narration: fallbackNarration(membersSaid) });
  }
}
