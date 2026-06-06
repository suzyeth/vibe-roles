import { describe, it, expect, beforeEach } from "vitest";
import { isOffline } from "@/lib/env";

describe("isOffline", () => {
  beforeEach(() => {
    delete process.env.GLM_OFFLINE;
  });
  it("defaults to false", () => {
    expect(isOffline()).toBe(false);
  });
  it("is true when GLM_OFFLINE='true'", () => {
    process.env.GLM_OFFLINE = "true";
    expect(isOffline()).toBe(true);
  });
});
