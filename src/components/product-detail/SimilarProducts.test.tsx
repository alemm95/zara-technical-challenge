import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ProductSummary } from "@/types/product";
import { SimilarProducts } from "./SimilarProducts";

const first: ProductSummary = {
  id: "SMG-A25",
  brand: "Samsung",
  name: "Galaxy A25 5G",
  basePrice: 239,
  imageUrl: "https://phones.example.test/images/SMG-A25.webp",
};

const second: ProductSummary = {
  id: "GPX-8A",
  brand: "Google",
  name: "Pixel 8a",
  basePrice: 459,
  imageUrl: "https://phones.example.test/images/GPX-8A.webp",
};

describe("SimilarProducts", () => {
  it("lists every similar product linking to its detail page", () => {
    render(<SimilarProducts products={[first, second]} />);

    expect(
      screen.getByRole("heading", { name: "SIMILAR ITEMS" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Samsung Galaxy A25 5G, 239 EUR" }),
    ).toHaveAttribute("href", "/product/SMG-A25");
    expect(
      screen.getByRole("link", { name: "Google Pixel 8a, 459 EUR" }),
    ).toHaveAttribute("href", "/product/GPX-8A");
  });

  it("renders nothing when there are no similar products", () => {
    const { container } = render(<SimilarProducts products={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("tolerates repeated product ids without duplicate-key errors", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<SimilarProducts products={[first, first]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
