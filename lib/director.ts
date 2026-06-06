import type { FateCard } from "@/lib/schema";

export function buildQuestPrompt(members: string[], theme: string) {
  const system = `You are the AI host of "Vibe Dice". Generate the opening of a 3-minute micro adventure.
Output JSON ONLY (no markdown): {"scene":{"theme":"...","setup":"<=25 words opening","tone":"chaotic, playful, safe"},"players":[{"name":"member name","role":"playful role","ability":"one-line ability","status":"active"}],"goal":"<=12 words goal"}
Rules: players count = number of members; witty roles (e.g. The Ghost Rogue / The Snack Healer); English; Gen Z tone; safe, no violence/explicit/hate.`;
  const user = `Theme: ${theme || "random"}\nMembers present: ${members.join(", ")}`;
  return { system, user };
}

export function buildRollPrompt(sceneSetup: string, label: string, fateCards: FateCard[], recent: string, reactors: { name: string; role: string }[]) {
  const fate = fateCards.length ? fateCards.map((f) => `${f.type}:${f.title}(${f.effect})`).join("; ") : "none";
  const cast = reactors.length ? reactors.map((r) => `${r.name}(${r.role})`).join(", ") : "none";
  const system = `You are the Vibe Dice host. Advance the story based on the dice result label. Output JSON ONLY (no markdown):
{"narration":"advance the story in <=25 words, reflecting the success/failure tone of the label, and weave in any pending Fate Cards","reactions":[{"member":"member name","text":"that member's in-character one-liner, <=12 words"}]}
Rules: reactions may ONLY include the given "reacting members", one line each; English; dramatic; Gen Z tone; safe.`;
  const user = `Scene: ${sceneSetup}\nPreviously: ${recent}\nDice result: ${label}\nPending Fate Cards: ${fate}\nReacting members: ${cast}`;
  return { system, user };
}

export function buildFateCardPrompt(type: string, input: string) {
  const system = `Turn a friend's one-line input into a structured Fate Card. Output JSON ONLY:
{"type":"character|object|curse|rule|blessing","title":"<=6 words","effect":"one-line effect","tone":"chaotic but harmless","trigger":"next_round|roll_under_10"}
Rules: type must equal the given type; effect is safe, fun, weaveable by the host; filter out violence/explicit/hate/personal attacks.`;
  const user = `Type: ${type}\nFriend input: ${input}`;
  return { system, user };
}

export function buildQuestCardPrompt(summary: string, finalRoll: number, fateTitles: string[]) {
  const system = `Generate a shareable result card for one Vibe Dice run. Output JSON ONLY:
{"title":"Quest Completed","caption":"<=5 words mood phrase","best_interference":"the most fun Fate Card title","final_roll":number,"cta":"Start your own quest on Zymix"}`;
  const user = `Ending summary: ${summary}\nFinal roll: ${finalRoll}\nCandidate Fate Cards: ${fateTitles.join(", ") || "none"}`;
  return { system, user };
}
