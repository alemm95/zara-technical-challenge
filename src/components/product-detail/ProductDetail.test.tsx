import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CartProvider } from "@/context/CartContext";
import { loadCart } from "@/context/cartStorage";
import type { ProductDetail as Product } from "@/types/product";
import { ProductDetail } from "./ProductDetail";

const product: Product = {
  id: "SMG-S24U",
  brand: "Samsung",
  name: "Galaxy S24 Ultra",
  basePrice: 1329,
  description: "A flagship phone.",
  rating: 4.6,
  specs: {
    screen: "6.8 inch AMOLED",
    resolution: "3120 x 1440",
    processor: "Snapdragon 8 Gen 3",
    mainCamera: "200 MP",
    selfieCamera: "12 MP",
    battery: "5000 mAh",
    os: "Android 14",
    screenRefreshRate: "120 Hz",
  },
  colorOptions: [
    {
      name: "Titanium Violet",
      hexCode: "#8E6F96",
      imageUrl: "https://phones.example.test/images/s24-violet.webp",
    },
    {
      name: "Titanium Black",
      hexCode: "#000000",
      imageUrl: "https://phones.example.test/images/s24-black.webp",
    },
  ],
  storageOptions: [
    { capacity: "256 GB", price: 1229 },
    { capacity: "512 GB", price: 1329 },
    { capacity: "1 TB", price: 1529 },
  ],
  similarProducts: [],
};

beforeEach(() => {
  localStorage.clear();
});

function renderDetail() {
  return render(
    <CartProvider>
      <CatalogHeader />
      <ProductDetail initialProduct={product} productId={product.id} />
    </CartProvider>,
  );
}

describe("ProductDetail", () => {
  it("selects the first color by default and keeps add-to-cart disabled until storage is chosen", () => {
    renderDetail();

    expect(
      screen.getByRole("button", { name: "Titanium Violet" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "ADD TO CART" })).toBeDisabled();
    expect(screen.getByText("From 1229 EUR")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Galaxy S24 Ultra in Titanium Violet" }),
    ).toHaveAttribute("src", expect.stringContaining("s24-violet.webp"));
  });

  it("changes image and selected color when another swatch is chosen", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: "Titanium Black" }));

    expect(
      screen.getByRole("button", { name: "Titanium Black" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("img", { name: "Galaxy S24 Ultra in Titanium Black" }),
    ).toHaveAttribute("src", expect.stringContaining("s24-black.webp"));
  });

  it("updates price by storage and adds the selected configuration to cart", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: "1 TB" }));
    expect(screen.getByText("1529 EUR")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD TO CART" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "ADD TO CART" }));

    expect(
      screen.getByRole("link", { name: "Shopping bag, 1 item" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ADDED TO BAG" }),
    ).toBeInTheDocument();
    const storedItems = loadCart();
    expect(storedItems).toHaveLength(1);
    expect(storedItems[0]?.product.imageUrl).toBe(
      "https://phones.example.test/images/s24-violet.webp",
    );
  });

  it("retries recoverable initial failures and loads the selected default color", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(product));

    render(
      <CartProvider>
        <CatalogHeader />
        <ProductDetail initialError productId={product.id} />
      </CartProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Titanium Violet" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });
});
