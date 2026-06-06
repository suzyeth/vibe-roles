import { describe, it, expect, beforeEach } from "vitest";
import { isOffline } from "@/lib/env";

describe("isOffline", () => {
  beforeEach(() => {
    delete process.env.GLM_OFFLINE;
  });
  it("默认为 false", () => {
    expect(isOffline()).toBe(false);
  });
  it("GLM_OFFLINE='true' 时为 true", () => {
    process.env.GLM_OFFLINE = "true";
    expect(isOffline()).toBe(true);
  });
});
