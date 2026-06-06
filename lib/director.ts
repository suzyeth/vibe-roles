import type { FateCard } from "@/lib/schema";

export function buildQuestPrompt(members: string[], theme: string) {
  const system = `你是 Vibe Dice 的 AI 主持人。生成一个 3 分钟微型冒险的开场。
严格只输出 JSON（不要 markdown）：{"scene":{"theme":"...","setup":"<=40字开场","tone":"chaotic, playful, safe"},"players":[{"name":"成员名","role":"轻松角色名","ability":"一句能力","status":"active"}],"goal":"<=20字目标"}
规则：players 数量=成员数；角色风趣(如 The Ghost Rogue/The Snack Healer)；中文+英文角色名皆可；Gen Z 语气；安全，不得暴力/露骨/仇恨。`;
  const user = `主题：${theme || "随机"}\n在场成员：${members.join("、")}`;
  return { system, user };
}

export function buildRollPrompt(sceneSetup: string, label: string, fateCards: FateCard[], recent: string) {
  const fate = fateCards.length ? fateCards.map((f) => `${f.type}:${f.title}(${f.effect})`).join("；") : "无";
  const system = `你是 Vibe Dice 主持人。根据骰子结果标签推进剧情一段(<=50字)，必须体现该标签的成败基调，并把"待生效 Fate Card"自然编进剧情。只输出旁白文本本身。中文，戏剧感，Gen Z 语气，安全。`;
  const user = `场景：${sceneSetup}\n前情：${recent}\n骰子结果：${label}\n待生效 Fate Cards：${fate}`;
  return { system, user };
}

export function buildFateCardPrompt(type: string, input: string) {
  const system = `你把好友的一句自由输入转成结构化 Fate Card。严格只输出 JSON：{"type":"character|object|curse|rule|blessing","title":"<=12字","effect":"一句话效果","tone":"chaotic but harmless","trigger":"next_round|roll_under_10"}
规则：type 必须等于给定类型；effect 安全、好玩、可被主持人编入剧情；过滤暴力/露骨/仇恨/人身攻击。`;
  const user = `类型：${type}\n好友输入：${input}`;
  return { system, user };
}

export function buildQuestCardPrompt(summary: string, finalRoll: number, fateTitles: string[]) {
  const system = `你给一局 Vibe Dice 生成可分享结果卡。严格只输出 JSON：{"title":"Quest Completed","caption":"<=10字气氛词","best_interference":"最出彩的 Fate Card 标题","final_roll":数字,"cta":"Start your own quest on Zymix"}`;
  const user = `结局摘要：${summary}\n最终骰子：${finalRoll}\n候选 Fate Cards：${fateTitles.join("、") || "无"}`;
  return { system, user };
}
