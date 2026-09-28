import { describe, expect, it } from "vitest";
import type { CartItem } from "@/types/cart";
import { cartReducer, initialCartState } from "./cartReducer";

const firstItem: CartItem = {
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

const secondItem: CartItem = {
  ...firstItem,
  id: "line-2",
  color: { ...firstItem.color, name: "Titanium Black" },
};

describe("cartReducer", () => {
  it("hydrates persisted items and marks the state ready", () => {
    expect(
      cartReducer(initialCartState, { type: "hydrate", items: [firstItem] }),
    ).toEqual({
      items: [firstItem],
      hydrated: true,
    });
  });

  it("adds separate configured units, including duplicate products", () => {
    const state = cartReducer(
      { items: [firstItem], hydrated: true },
      { type: "add", item: secondItem },
    );

    expect(state.items).toEqual([firstItem, secondItem]);
    expect(state.items).toHaveLength(2);
  });

  it("removes only the requested cart line", () => {
    const state = cartReducer(
      { items: [firstItem, secondItem], hydrated: true },
      { type: "remove", itemId: "line-1" },
    );

    expect(state.items).toEqual([secondItem]);
  });

  it("clears all lines without changing hydration state", () => {
    expect(
      cartReducer({ items: [firstItem], hydrated: true }, { type: "clear" }),
    ).toEqual({ items: [], hydrated: true });
  });
});
