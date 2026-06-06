import { describe, it, expect } from "vitest";
import { fallbackScene, fallbackNarration, fallbackHighlight, fallbackActLine, fallbackRound } from "@/lib/fallback";
import { SceneSchema, HighlightSchema, RoundSchema } from "@/lib/schema";

describe("fallbackScene", () => {
  it("通过 SceneSchema 校验", () => {
    expect(() => SceneSchema.parse(fallbackScene(["A", "B"], "悬疑"))).not.toThrow();
  });
  it("roles 数量等于 members 数量", () => {
    const members = ["A", "B", "C", "D", "E"];
    expect(fallbackScene(members, "悬疑").roles).toHaveLength(members.length);
  });
  it("飞船危机 变体：theme 与首个角色匹配并通过 SceneSchema", () => {
    const s = fallbackScene(["A", "B"], "飞船危机");
    expect(s.scene.theme).toBe("飞船危机");
    expect(s.roles[0].role).toBe("舰长");
    expect(() => SceneSchema.parse(s)).not.toThrow();
  });
  it("空主题默认首个变体（宿舍悬案）并通过 SceneSchema", () => {
    const s = fallbackScene(["A"], "");
    expect(s.scene.theme).toBe("宿舍悬案");
    expect(() => SceneSchema.parse(s)).not.toThrow();
  });
});

describe("fallbackRound", () => {
  it("lines 数量等于 roles，member 与输入一致，通过 RoundSchema", () => {
    const roles = [
      { member: "阿K", role: "反派" },
      { member: "小鹿", role: "侦探" },
    ];
    const r = fallbackRound(roles, 0);
    expect(r.lines).toHaveLength(2);
    expect(r.lines[0].member).toBe("阿K");
    expect(r.lines[1].member).toBe("小鹿");
    expect(() => RoundSchema.parse(r)).not.toThrow();
  });
  it("空 roles 仍返回合法 RoundSchema（非空 lines 兜底）", () => {
    const r = fallbackRound([], 0);
    expect(() => RoundSchema.parse(r)).not.toThrow();
  });
});

describe("fallbackNarration", () => {
  it("返回非空文本", () => {
    expect(fallbackNarration("历史").length).toBeGreaterThan(0);
  });
});

describe("fallbackActLine", () => {
  it("seed 0 返回第一句", () => {
    expect(fallbackActLine(0)).toBe("这事儿绝对不是我干的！");
  });
  it("seed 4 回绕到第一句", () => {
    expect(fallbackActLine(4)).toBe("这事儿绝对不是我干的！");
  });
  it("负数 seed 返回有效台词", () => {
    expect(fallbackActLine(-1)).toBeDefined();
  });
});

describe("fallbackHighlight", () => {
  it("选中文本最长的发言并通过 HighlightSchema", () => {
    const transcript = [
      { member: "A", text: "短" },
      { member: "B", text: "这是一段最长的发言内容" },
      { member: "C", text: "中等长度" },
    ];
    const h = fallbackHighlight(transcript);
    expect(h.member).toBe("B");
    expect(h.line).toBe("这是一段最长的发言内容");
    expect(() => HighlightSchema.parse(h)).not.toThrow();
  });
});
