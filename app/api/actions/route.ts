import { isOffline } from "@/lib/env";
import { fallbackActions } from "@/lib/fallback";
import { buildActionsPrompt } from "@/lib/director";
import { glmJSON } from "@/lib/glm";
import { ActionOptionsSchema } from "@/lib/schema";

interface ActionsReq {
  questId: string;
  recent: string;
  active: { name: string; role: string };
  seed?: number;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: ActionsReq = await req.json();
    const { questId, recent, active, seed = 0 } = body;
    if (!questId || !recent || !active?.name || !active?.role) {
      return Response.json({ options: [] }, { status: 400 });
    }
    if (isOffline()) {
      return Response.json(fallbackActions(active, seed));
    }
    try {
      const { system, user } = buildActionsPrompt(recent, recent, active);
      const raw = await glmJSON(system, user);
      const parsed = ActionOptionsSchema.parse(raw);
      return Response.json(parsed);
    } catch {
      return Response.json(fallbackActions(active, seed));
    }
  } catch {
    return Response.json({ options: [] }, { status: 500 });
  }
}