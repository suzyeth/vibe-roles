import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { padWithNPCs, buildScenePrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { fallbackScene } from "@/lib/fallback";
import { SceneSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { members, theme } = await req.json();
  const actors: string[] = padWithNPCs(Array.isArray(members) ? members : []);
  if (isOffline()) return Response.json(fallbackScene(actors, theme));
  try {
    const { system, user } = buildScenePrompt(actors, theme);
    const scene = SceneSchema.parse(await glmJSON(system, user));
    return Response.json(scene);
  } catch {
    return Response.json(fallbackScene(actors, theme));
  }
}
