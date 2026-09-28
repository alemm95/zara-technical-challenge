import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/context/CartContext";
import { CatalogHeader } from "./CatalogHeader";

describe("CatalogHeader", () => {
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
});
