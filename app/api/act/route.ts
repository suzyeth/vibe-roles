import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { buildActPrompt } from "@/lib/director";
import { glmText } from "@/lib/glm";
import { fallbackActLine } from "@/lib/fallback";

export async function POST(req: NextRequest) {
  const { role, sceneSetup, last, seed } = await req.json();
  const s = typeof seed === "number" ? seed : 0;
  if (isOffline()) return Response.json({ line: fallbackActLine(s) });
  try {
    const { system, user } = buildActPrompt(role ?? "", sceneSetup ?? "", last ?? "");
    const line = (await glmText(system, user)).trim();
    return Response.json({ line: line || fallbackActLine(s) });
  } catch {
    return Response.json({ line: fallbackActLine(s) });
  }
}
