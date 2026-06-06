import { describe, it, expect } from "vitest";
import { padWithNPCs, buildScenePrompt, buildNarratePrompt, buildActPrompt, buildRoundPrompt } from "@/lib/director";

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

describe("buildActPrompt", () => {
  it("user 含角色与场景，system 含台词", () => {
    const { system, user } = buildActPrompt("反派", "飞船失火", "有人尖叫");
    expect(user).toContain("反派");
    expect(user).toContain("飞船失火");
    expect(system).toContain("台词");
  });
});

describe("buildRoundPrompt", () => {
  it("system 含 JSON，user 含成员、角色、场景、最近剧情", () => {
    const { system, user } = buildRoundPrompt("飞船失火", [{ member: "阿K", role: "反派" }], "有人尖叫");
    expect(system).toContain("JSON");
    expect(user).toContain("阿K");
    expect(user).toContain("反派");
    expect(user).toContain("飞船失火");
    expect(user).toContain("有人尖叫");
  });
});
