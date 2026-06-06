import { NextRequest } from "next/server";
import { isOffline } from "@/lib/env";
import { glmJSON } from "@/lib/glm";
import { fallbackHighlight } from "@/lib/fallback";
import { HighlightSchema } from "@/lib/schema";

const SYSTEM = `你是评审。从对话记录里挑出最好笑/最有梗的一句，只输出 JSON：
{"member":"发言人","line":"原话","card_caption":"给这句配一个<=12字的卡片标题"}`;

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  const list = Array.isArray(transcript) ? transcript : [];
  if (isOffline()) return Response.json(fallbackHighlight(list));
  try {
    const user = list.map((t: any) => `${t.member}：${t.text}`).join("\n");
    const h = HighlightSchema.parse(await glmJSON(SYSTEM, user));
    return Response.json(h);
  } catch {
    return Response.json(fallbackHighlight(list));
  }
}
