import type { Scene, Highlight } from "@/lib/schema";

const FALLBACK_ROLES = ["主角", "反派", "神秘人", "旁观者"];

export function fallbackScene(members: string[], theme: string): Scene {
  return {
    scene: { theme: theme || "宿舍悬案", setup: "深夜宿舍，最后一桶泡面不翼而飞。" },
    roles: members.map((m, i) => ({
      member: m,
      role: FALLBACK_ROLES[i % FALLBACK_ROLES.length],
      hook: "说一句你的不在场证明",
    })),
    opening_narration: "案发现场只剩半碗泡面汤……谁是真凶？",
    beats: [{ narration: "线索一：调料包居然还是热的。" }],
    ending: "真凶竟是——那只总蹲窗台的橘猫。",
  };
}

export function fallbackNarration(_history: string): string {
  return "剧情急转直下，所有人都把目光投向了门口……";
}

export function fallbackHighlight(transcript: { member: string; text: string }[]): Highlight {
  const best = transcript.reduce(
    (a, b) => (b.text.length > a.text.length ? b : a),
    transcript[0] ?? { member: "AI", text: "全场陷入沉默" },
  );
  return { member: best.member, line: best.text, card_caption: "本局名场面 · Vibe Roles" };
}
