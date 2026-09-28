import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  buildProductHref,
  normalizeCatalogSearch,
} from "./catalogSearch";

describe("normalizeCatalogSearch", () => {
  it("trims, collapses whitespace and takes the first repeated value", () => {
    expect(normalizeCatalogSearch("  galaxy   s24 ")).toBe("galaxy s24");
    expect(normalizeCatalogSearch(["apple", "samsung"])).toBe("apple");
  });

  it("treats missing values as an empty search", () => {
    expect(normalizeCatalogSearch(undefined)).toBe("");
    expect(normalizeCatalogSearch(null)).toBe("");
    expect(normalizeCatalogSearch([])).toBe("");
  });

  it("caps very long searches", () => {
    expect(normalizeCatalogSearch("a".repeat(200))).toHaveLength(80);
  });
});

describe("catalog hrefs", () => {
  it("only adds the search parameter when there is a term", () => {
    expect(buildCatalogHref()).toBe("/");
    expect(buildCatalogHref("  ")).toBe("/");
    expect(buildCatalogHref("iphone 15")).toBe("/?search=iphone+15");
  });

  it("keeps the search when linking to a product", () => {
    expect(buildProductHref("SMG-S24U")).toBe("/product/SMG-S24U");
    expect(buildProductHref("SMG-S24U", "galaxy")).toBe(
      "/product/SMG-S24U?search=galaxy",
    );
    expect(buildProductHref("a/b")).toBe("/product/a%2Fb");
  });
});
