import { describe, expect, it } from "vitest";
import { sum } from "./index";

describe("sum", () => {
  it("should be 5 when 2 plus 3", () => {
    expect(sum(2, 3)).toBe(5);
  });

  it("should be 0 when 0 plus 0", () => {
    expect(sum(0, 0)).toBe(0);
  });

  it("should be -1 when 2 plus -3", () => {
    expect(sum(2, -3)).toBe(-1);
  });
});
