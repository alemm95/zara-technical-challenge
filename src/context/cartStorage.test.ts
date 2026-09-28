import { beforeEach, describe, expect, it } from "vitest";
import type { CartItem } from "@/types/cart";
import { CART_STORAGE_KEY, loadCart, saveCart } from "./cartStorage";

const validItem: CartItem = {
  id: "line-1",
  product: {
    id: "SMG-S24U",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1329,
    imageUrl: "https://phones.example.test/s24.webp",
  },
  color: {
    name: "Titanium Violet",
    hexCode: "#8E6F96",
    imageUrl: "https://phones.example.test/s24-violet.webp",
  },
  storage: { capacity: "512 GB", price: 1329 },
};

beforeEach(() => {
  localStorage.clear();
});

describe("cartStorage", () => {
  it("saves and restores configured cart items", () => {
    expect(saveCart([validItem])).toBe(true);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(
      JSON.stringify([validItem]),
    );
    expect(loadCart()).toEqual([validItem]);
  });

  it("returns an empty cart when there is no saved value", () => {
    expect(loadCart()).toEqual([]);
  });

  it("ignores malformed JSON and invalid cart lines", () => {
    localStorage.setItem(CART_STORAGE_KEY, "not-json");
    expect(loadCart()).toEqual([]);

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([validItem, { id: "invalid", product: {} }]),
    );
    expect(loadCart()).toEqual([validItem]);
  });

  it("discards duplicate line ids in persisted data", () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([validItem, validItem]),
    );

    expect(loadCart()).toEqual([validItem]);
  });

  it("upgrades http image URLs saved by earlier versions", () => {
    const legacyItem: CartItem = {
      ...validItem,
      product: {
        ...validItem.product,
        imageUrl: "http://phones.test/s24.webp",
      },
      color: { ...validItem.color, imageUrl: "http://phones.test/violet.webp" },
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([legacyItem]));

    const [restored] = loadCart();

    expect(restored?.product.imageUrl).toBe("https://phones.test/s24.webp");
    expect(restored?.color.imageUrl).toBe("https://phones.test/violet.webp");
  });
});
