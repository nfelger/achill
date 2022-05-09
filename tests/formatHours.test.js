import { expect, test } from "@playwright/test";
import { formatHours } from "../src/lib/formatHours.js";

test.describe("formatHours", async () => {
  test("1 returns 1:00", () => {
    expect(formatHours("1")).toBe("1:00");
  });

  test("hh:mm returns hh:mm", () => {
    expect(formatHours("01:00")).toBe("1:00");
  });

  test("h.hourFraction returns hh:mm", () => {
    expect(formatHours("1.33333")).toBe("1:20");
  });
});
