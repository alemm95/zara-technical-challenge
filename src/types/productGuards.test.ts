import { describe, expect, it } from "vitest";
import {
  isProductDetail,
  isProductListResponse,
  isProductSummary,
} from "./productGuards";

const summary = {
  id: "SMG-S24U",
  brand: "Samsung",
  name: "Galaxy S24 Ultra",
  basePrice: 1329,
  imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
};

const detail = {
  ...summary,
  description: "A flagship phone.",
  rating: 4.6,
  specs: { screen: "6.8 inch AMOLED" },
  colorOptions: [
    {
      name: "Titanium Violet",
      hexCode: "#8E6F96",
      imageUrl: "https://phones.example.test/images/violet.webp",
    },
  ],
  storageOptions: [{ capacity: "256 GB", price: 1229 }],
  similarProducts: [summary],
};

describe("productGuards", () => {
  it("accepts a valid product summary and rejects malformed ones", () => {
    expect(isProductSummary(summary)).toBe(true);
    expect(isProductSummary({ ...summary, basePrice: "1329" })).toBe(false);
    expect(isProductSummary(null)).toBe(false);
  });

  it("validates the catalog response envelope", () => {
    expect(isProductListResponse({ products: [summary], count: 1 })).toBe(true);
    expect(isProductListResponse({ products: [summary] })).toBe(false);
    expect(isProductListResponse({ products: [{ id: "x" }], count: 1 })).toBe(
      false,
    );
  });

  it("validates product detail including nested options", () => {
    expect(isProductDetail(detail)).toBe(true);
    expect(isProductDetail({ ...detail, colorOptions: [{ name: "x" }] })).toBe(
      false,
    );
    expect(
      isProductDetail({ ...detail, storageOptions: [{ capacity: "256 GB" }] }),
    ).toBe(false);
    expect(isProductDetail({ ...detail, similarProducts: undefined })).toBe(
      false,
    );
  });
});
