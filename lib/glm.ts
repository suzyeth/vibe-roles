type Msg = { role: "system" | "user" | "assistant"; content: string };

const BASE = process.env.GLM_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const KEY = process.env.GLM_API_KEY ?? "";
const MODEL = process.env.GLM_MODEL ?? "glm-4.6";

async function call(messages: Msg[], jsonMode: boolean): Promise<string> {
  // Bound the call so a slow/hung GLM never freezes the route (and the UI) forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.GLM_TIMEOUT_MS ?? 18000));
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.9,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`GLM ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

export async function glmJSON(system: string, user: string): Promise<unknown> {
  const raw = await call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    true,
  );
  // Some providers wrap JSON in ```json fences despite response_format — strip them.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function glmText(system: string, user: string): Promise<string> {
  return call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    false,
  );
}
