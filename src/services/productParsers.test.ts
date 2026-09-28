import { describe, expect, it } from "vitest";
import { parseProductDetail, parseProductList } from "./productParsers";

const summary = {
  id: "SMG-A25",
  brand: "Samsung",
  name: "Galaxy A25 5G",
  basePrice: 239,
  imageUrl: "http://phones.example.test/a25.webp",
};

const detail = {
  ...summary,
  description: "A phone.",
  rating: 4,
  specs: { screen: "6.5 inch" },
  colorOptions: [
    {
      name: "Blue",
      hexCode: "#0000ff",
      imageUrl: "http://phones.example.test/blue.webp",
    },
  ],
  storageOptions: [{ capacity: "128 GB", price: 239 }],
  similarProducts: [summary],
};

describe("productParsers", () => {
  it("returns https URLs for every image in a product list", () => {
    expect(parseProductList([summary])[0]?.imageUrl).toBe(
      "https://phones.example.test/a25.webp",
    );
  });

  it("returns https URLs for detail, colors and similar products", () => {
    const parsed = parseProductDetail(detail);

    expect(parsed.imageUrl).toBe("https://phones.example.test/a25.webp");
    expect(parsed.colorOptions[0]?.imageUrl).toBe(
      "https://phones.example.test/blue.webp",
    );
    expect(parsed.similarProducts[0]?.imageUrl).toBe(
      "https://phones.example.test/a25.webp",
    );
  });

  it("does not mutate the original payload", () => {
    parseProductDetail(detail);

    expect(detail.imageUrl).toBe("http://phones.example.test/a25.webp");
  });

  it("rejects malformed payloads", () => {
    expect(() => parseProductList({})).toThrow("Unexpected products response");
    expect(() => parseProductDetail({ id: "x" })).toThrow(
      "Unexpected product response",
    );
  });
});
