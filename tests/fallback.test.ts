import { describe, it, expect } from "vitest";
import { fallbackScene, fallbackNarration, fallbackHighlight, fallbackActLine } from "@/lib/fallback";
import { SceneSchema, HighlightSchema } from "@/lib/schema";

describe("fallbackScene", () => {
  it("通过 SceneSchema 校验", () => {
    expect(() => SceneSchema.parse(fallbackScene(["A", "B"], "悬疑"))).not.toThrow();
  });
  it("roles 数量等于 members 数量", () => {
    const members = ["A", "B", "C", "D", "E"];
    expect(fallbackScene(members, "悬疑").roles).toHaveLength(members.length);
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
