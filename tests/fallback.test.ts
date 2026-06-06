import { describe, it, expect } from "vitest";
import { fallbackScene, fallbackNarration, fallbackHighlight } from "@/lib/fallback";
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
