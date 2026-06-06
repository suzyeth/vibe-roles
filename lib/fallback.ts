import type { Scene, Highlight, Round } from "@/lib/schema";

type Variant = { theme: string; setup: string; roleNames: string[]; opening: string; beat: string; ending: string };
const VARIANTS: Variant[] = [
  { theme: "宿舍悬案", setup: "深夜宿舍，最后一桶泡面不翼而飞。", roleNames: ["侦探", "嫌疑人", "目击者", "神秘人"], opening: "案发现场只剩半碗泡面汤……谁是真凶？", beat: "线索一：调料包居然还是热的。", ending: "真凶竟是——那只总蹲窗台的橘猫。" },
  { theme: "综艺现场", setup: "录影棚灯光亮起，一场抢答综艺开始了。", roleNames: ["主持人", "卫冕冠军", "黑马选手", "捣乱观众"], opening: "三、二、一——抢答开始！", beat: "比分胶着，导播突然换了赛制。", ending: "冠军竟是全程没按铃的那位。" },
  { theme: "飞船危机", setup: "深空飞船警报大作，氧气只剩十分钟。", roleNames: ["舰长", "工程师", "可疑机器人", "偷渡客"], opening: "警报！是谁动了主控台？", beat: "线索指向货舱那个一直没说话的人。", ending: "原来按错按钮的，是舰长自己。" },
  { theme: "八卦法庭", setup: "群聊开庭，审理「谁先已读不回」一案。", roleNames: ["法官", "原告", "被告", "吃瓜陪审"], opening: "现在开庭——谁先把对方晾了三天？", beat: "聊天记录被当庭甩出，全场哗然。", ending: "判决：双方都有罪，各发一个红包谢罪。" },
];
function pickVariant(theme: string): Variant {
  return VARIANTS.find((v) => v.theme === theme) ?? VARIANTS[0];
}
export function fallbackScene(members: string[], theme: string): Scene {
  const v = pickVariant(theme);
  return {
    scene: { theme: theme || v.theme, setup: v.setup },
    roles: members.map((m, i) => ({ member: m, role: v.roleNames[i % v.roleNames.length], hook: "接着剧情冒一句" })),
    opening_narration: v.opening,
    beats: [{ narration: v.beat }],
    ending: v.ending,
  };
}

export function fallbackNarration(_history: string): string {
  return "剧情急转直下，所有人都把目光投向了门口……";
}

const ACT_LINES = ["这事儿绝对不是我干的！", "等等，我好像看到了什么…", "别看我，我只是路过的。", "我有一个大胆的想法。"];
export function fallbackActLine(seed: number): string {
  return ACT_LINES[((seed % ACT_LINES.length) + ACT_LINES.length) % ACT_LINES.length];
}

const LINE_POOL = ["这事儿绝对不是我干的！", "等等，我好像看到了什么…", "别看我，我只是路过的。", "我有一个大胆的想法。", "你们都别动，我来推理。", "事到如今我只能坦白了…"];
const NARR_POOL = ["话音刚落，所有人都安静了。", "剧情急转，矛头指向了下一个人。", "气氛突然变得微妙起来。", "就在这时，新的线索出现了。"];
export function fallbackRound(roles: { member: string; role: string }[], seed: number): Round {
  const lines = roles.map((r, i) => ({ member: r.member, role: r.role, text: LINE_POOL[(seed * roles.length + i) % LINE_POOL.length] }));
  return {
    lines: lines.length ? lines : [{ member: "AI", role: "旁观者", text: "全场陷入沉默" }],
    narration: NARR_POOL[((seed % NARR_POOL.length) + NARR_POOL.length) % NARR_POOL.length],
  };
}

export function fallbackHighlight(transcript: { member: string; text: string }[]): Highlight {
  const best = transcript.reduce(
    (a, b) => (b.text.length > a.text.length ? b : a),
    transcript[0] ?? { member: "AI", text: "全场陷入沉默" },
  );
  return { member: best.member, line: best.text, card_caption: "本局名场面 · Vibe Roles" };
}
