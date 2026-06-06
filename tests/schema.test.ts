import { describe, it, expect } from "vitest";
import { SceneSchema, HighlightSchema } from "@/lib/schema";

const validScene = {
  scene: { theme: "宿舍悬案", setup: "深夜宿舍，泡面失踪" },
  roles: [{ member: "Alex", role: "侦探", hook: "找出真凶" }],
  opening_narration: "案发现场只剩泡面汤",
  beats: [{ narration: "线索一：调料包还热着" }],
  ending: "真凶竟是那只猫",
};

describe("SceneSchema", () => {
  it("接受合法 scene", () => {
    expect(SceneSchema.parse(validScene)).toBeTruthy();
  });
  it("拒绝 roles 为空", () => {
    expect(() => SceneSchema.parse({ ...validScene, roles: [] })).toThrow();
  });
  it("拒绝缺字段", () => {
    expect(() => SceneSchema.parse({ scene: {} })).toThrow();
  });
});

describe("HighlightSchema", () => {
  it("接受合法 highlight", () => {
    expect(
      HighlightSchema.parse({ member: "Alex", line: "是猫干的", card_caption: "真凶现形" }),
    ).toBeTruthy();
  });
});
