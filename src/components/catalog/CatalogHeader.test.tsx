import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/context/CartContext";
import { CatalogHeader } from "./CatalogHeader";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("CatalogHeader", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/");
  });

  it("does not render a temporary zero before cart hydration", () => {
    const markup = renderToString(
      <CartProvider>
        <CatalogHeader />
      </CartProvider>,
    );

    expect(markup).toContain('aria-label="Shopping bag"');
    expect(markup).not.toContain("Shopping bag, 0 items");
    expect(markup).toContain('data-hydrated="false"');
  });

  it("hides the shopping bag link on the cart route", () => {
    usePathnameMock.mockReturnValue("/cart");

    const markup = renderToString(
      <CartProvider>
        <CatalogHeader />
      </CartProvider>,
    );

    expect(markup).not.toContain('aria-label="Shopping bag"');
    expect(markup).not.toContain('href="/cart"');
    expect(markup).toContain('aria-label="MBST home"');
  });
});
