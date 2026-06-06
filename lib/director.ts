import type { FateCard, Quest } from "@/lib/schema";

/** Prompt for an AI-written opening prologue, revealed line-by-line before the first roll. */
export function buildProloguePrompt(quest: Quest) {
  const heroes = quest.players.map((p) => `${p.name} the ${p.role}`).join(", ");
  const system = `You are the Game Master of "Vibe Dice". Write a THRILLING story PROLOGUE that opens the adventure, read out before the first dice roll.
Output JSON ONLY (no markdown): {"lines":["line 1","line 2","line 3"]}
Rules: exactly 3 lines, each <=15 words, English, cinematic and high-stakes — build tension, name the danger, hint at stakes — Gen Z and witty, safe (no violence/explicit/hate). End on a cliffhanger that makes them want to roll.`;
  const user = `Theme: ${quest.scene.theme}\nSetup: ${quest.scene.setup}\nGoal: ${quest.goal}\nHeroes: ${heroes}`;
  return { system, user };
}

export function buildQuestPrompt(members: string[], theme: string) {
  const system = `You are the AI Game Master of "Vibe Dice". Open a 3-minute micro adventure with a THRILLING cold open.
Output JSON ONLY (no markdown): {"scene":{"theme":"...","setup":"2-3 vivid, high-stakes sentences that hook the group instantly: drop them into danger, a mystery, or a ticking problem","tone":"thrilling, playful, safe"},"players":[{"name":"member name","role":"playful role","ability":"one-line ability","status":"active"}],"goal":"<=14 words goal"}
Rules: players count = number of members; witty roles (e.g. The Ghost Rogue / The Snack Healer); English; cinematic but Gen Z; safe, no violence/explicit/hate.`;
  const user = `Theme: ${theme || "random"}\nMembers present: ${members.join(", ")}`;
  return { system, user };
}

/** Generate 2-3 action options for the active player. */
export function buildActionsPrompt(sceneSetup: string, recent: string, active: { name: string; role: string }) {
  const system = `You are the Vibe Dice Game Master. Generate 2-3 concrete action options for the active player to choose from. Output JSON ONLY (no markdown):
{"options":["option 1","option 2","option 3"]}
Rules: each option <=10 words; fit the scene and the active player's role; offer a mix of cautious, bold, and creative choices; English; Gen Z tone; safe.`;
  const user = `Scene: ${sceneSetup}\nPreviously: ${recent}\nActive player: ${active.name} the ${active.role}`;
  return { system, user };
}

export function buildRollPrompt(sceneSetup: string, label: string, fateCards: FateCard[], recent: string, reactors: { name: string; role: string }[], active?: { name: string; role: string }, action?: string) {
  const fate = fateCards.length ? fateCards.map((f) => `${f.type}:${f.title}(${f.effect})`).join("; ") : "none";
  const cast = reactors.length ? reactors.map((r) => `${r.name}(${r.role})`).join(", ") : "none";
  const actionContext = active && action ? `\nActive action: ${active.name} the ${active.role} chose to ${action}` : "";
  const system = `You are the Vibe Dice Game Master. A hero just acted and the dice decided their fate. Narrate the OUTCOME as a vivid scene. Output JSON ONLY (no markdown):
{"narration":"2-4 cinematic sentences: reflect the success/failure tone of the dice label, show concrete consequences and rising stakes, weave in any pending Fate Cards, and end on a hook or a choice. If a specific action was taken, the narration MUST explicitly react to that action's outcome.","reactions":[{"member":"member name","text":"that member's in-character one-liner, <=14 words"}]}
Rules: continue naturally from "Previously" for continuity; reactions may ONLY include the given "reacting members", one line each; English; dramatic, Gen Z; safe.`;
  const user = `Scene: ${sceneSetup}\nPreviously: ${recent}\nDice result: ${label}\nPending Fate Cards: ${fate}\nReacting members: ${cast}${actionContext}`;
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
