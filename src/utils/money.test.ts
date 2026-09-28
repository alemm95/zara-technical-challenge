import { describe, expect, it } from "vitest";
import { formatPrice, sumPrices, toCents } from "./money";

describe("money", () => {
  it("converts decimal amounts to integer cents without float noise", () => {
    expect(toCents(553.31)).toBe(55331);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(1329)).toBe(132900);
  });

  it("sums prices exactly", () => {
    expect(sumPrices([])).toBe(0);
    expect(sumPrices([553.31, 553.31])).toBe(1106.62);
    expect(sumPrices([0.1, 0.2])).toBe(0.3);
  });

  it("formats whole amounts without decimals and fractions with two", () => {
    expect(formatPrice(1329)).toBe("1329 EUR");
    expect(formatPrice(553.31)).toBe("553.31 EUR");
    expect(formatPrice(99.5)).toBe("99.50 EUR");
    expect(formatPrice(1106.6200000000001)).toBe("1106.62 EUR");
  });
});
