import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { CartProvider } from "@/context/CartContext";
import { CART_STORAGE_KEY } from "@/context/cartStorage";
import type { CartItem } from "@/types/cart";
import { CartView } from "./CartView";

const firstItem: CartItem = {
  id: "s24-violet-512",
  product: {
    id: "SMG-S24U",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1329,
    imageUrl: "https://phones.example.test/s24.webp",
  },
  color: {
    name: "Violet Titanium",
    hexCode: "#5A536B",
    imageUrl: "https://phones.example.test/s24-violet.webp",
  },
  storage: { capacity: "512 GB", price: 1199 },
};

const secondItem: CartItem = {
  ...firstItem,
  id: "s24-black-256",
  color: { ...firstItem.color, name: "Black Titanium" },
  storage: { capacity: "256 GB", price: 1099 },
};

function renderCart(items: CartItem[] = []) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  return render(
    <CartProvider>
      <CartView />
    </CartProvider>,
  );
}

describe("CartView", () => {
  it("renders variants, total and a return link", async () => {
    const { container } = renderCart([firstItem, secondItem]);

    expect(
      await screen.findByRole("heading", { name: "CART (2)" }),
    ).toBeVisible();
    expect(screen.getByText("512 GB | Violet Titanium")).toBeInTheDocument();
    expect(screen.getByText("256 GB | Black Titanium")).toBeInTheDocument();
    expect(screen.getByText("2298 EUR")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "CONTINUE SHOPPING" }),
    ).toHaveAttribute("href", "/");
    const accessibilityResults = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(accessibilityResults.violations).toEqual([]);
  });

  it("removes only the selected cart line", async () => {
    const user = userEvent.setup();
    renderCart([firstItem, secondItem]);

    await screen.findByRole("heading", { name: "CART (2)" });
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    await user.click(removeButtons[0]);

    expect(
      await screen.findByRole("heading", { name: "CART (1)" }),
    ).toBeVisible();
    expect(screen.queryByText("512 GB | Violet Titanium")).toBeNull();
    expect(screen.getAllByText("1099 EUR")).toHaveLength(2);
  });

  it("shows the empty state after removing the last item", async () => {
    const user = userEvent.setup();
    renderCart([firstItem]);

    await screen.findByRole("heading", { name: "CART (1)" });
    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "CART (0)" })).toBeVisible();
    });
    expect(screen.queryByText("Your cart is empty.")).toBeNull();
  });
});
