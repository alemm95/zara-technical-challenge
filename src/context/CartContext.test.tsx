import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import type { CartItem, NewCartItem } from "@/types/cart";
import { CartProvider, useCart } from "./CartContext";
import { CART_STORAGE_KEY } from "./cartStorage";

const firstItem: NewCartItem = {
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

const secondItem: NewCartItem = {
  ...firstItem,
  color: { ...firstItem.color, name: "Titanium Black" },
  storage: { capacity: "1 TB", price: 1529 },
};

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartProvider", () => {
  it("hydrates the cart from localStorage without overwriting it with the empty initial state", async () => {
    const persistedItem: CartItem = { ...firstItem, id: "persisted-line" };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([persistedItem]));

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.items).toEqual([persistedItem]);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(
      JSON.stringify([persistedItem]),
    );
  });

  it("adds independent configurations and persists totals", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.addItem(firstItem);
      result.current.addItem(secondItem);
    });

    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]"),
      ).toHaveLength(2);
    });

    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(2858);
    expect(result.current.items[0]?.id).not.toBe(result.current.items[1]?.id);
  });

  it("removes a single line and clears all persisted lines", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.addItem(firstItem);
      result.current.addItem(secondItem);
    });

    await waitFor(() => expect(result.current.totalItems).toBe(2));
    const firstId = result.current.items[0]?.id;

    act(() => result.current.removeItem(firstId ?? ""));
    await waitFor(() => expect(result.current.totalItems).toBe(1));
    expect(result.current.totalPrice).toBe(1529);

    act(() => result.current.clearCart());
    await waitFor(() => {
      expect(result.current.items).toEqual([]);
      expect(localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
    });
  });

  it("rejects use outside the provider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within a CartProvider.",
    );
  });
});
