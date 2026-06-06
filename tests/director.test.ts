import { describe, it, expect } from "vitest";
import { padWithNPCs, buildScenePrompt, buildNarratePrompt } from "@/lib/director";

describe("padWithNPCs", () => {
  it("补足到 3 人", () => {
    expect(padWithNPCs(["A"])).toEqual(["A", "AI·路人甲", "AI·路人乙"]);
  });
  it("已有 3 人则不变", () => {
    expect(padWithNPCs(["A", "B", "C"])).toEqual(["A", "B", "C"]);
  });
});

describe("buildScenePrompt", () => {
  it("system 含 JSON，user 含主题与成员", () => {
    const { system, user } = buildScenePrompt(["Alex", "Bob"], "宿舍悬案");
    expect(system).toContain("JSON");
    expect(user).toContain("宿舍悬案");
    expect(user).toContain("Alex");
  });
});

describe("buildNarratePrompt", () => {
  it("user 含成员发言文本", () => {
    const { user } = buildNarratePrompt("深夜宿舍", "我什么都没做");
    expect(user).toContain("我什么都没做");
  });
});
