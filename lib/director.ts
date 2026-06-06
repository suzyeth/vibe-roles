const NPC_NAMES = ["AI·路人甲", "AI·路人乙", "AI·路人丙"];

export function padWithNPCs(members: string[]): string[] {
  const out = [...members];
  let i = 0;
  while (out.length < 3 && i < NPC_NAMES.length) out.push(NPC_NAMES[i++]);
  return out;
}

export function buildScenePrompt(members: string[], theme: string) {
  const system = `你是 Vibe Roles 的导演。根据"主题"和"在场成员名单"，即兴现编一个30秒微剧场。
严格只输出 JSON（不要 markdown 代码块），结构：
{"scene":{"theme":"...","setup":"一句话场景设定"},
 "roles":[{"member":"成员名","role":"角色名","hook":"一句话任务/台词钩子"}],
 "opening_narration":"旁白开场(<=40字)",
 "beats":[{"narration":"..."}],
 "ending":"反转结局(<=40字)"}
规则：roles 数量必须等于成员数；每个成员都要出现；中文；Gen Z 活泼语气；不得生成暴力/露骨/歧视等不当内容。`;
  const user = `主题：${theme || "随机"}\n在场成员：${members.join("、")}`;
  return { system, user };
}

export function buildNarratePrompt(sceneSetup: string, membersSaid: string) {
  const system = `你是旁白。把成员刚才的发言接龙进剧情，推进一段(<=50字)，结尾留钩子让大家继续。中文，戏剧感，Gen Z 语气。只输出旁白文本本身。`;
  const user = `场景：${sceneSetup}\n成员刚才的发言：${membersSaid}`;
  return { system, user };
}
