import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
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
  similarProducts: [
    {
      id: "SMG-A25",
      brand: "Samsung",
      name: "Galaxy A25 5G",
      basePrice: 239,
      imageUrl: "https://phones.example.test/images/a25.webp",
    },
  ],
};

beforeEach(() => {
  localStorage.clear();
});

function renderDetail(search?: string) {
  return render(
    <CartProvider>
      <CatalogHeader />
      <ProductDetail product={product} search={search} />
    </CartProvider>,
  );
}

const addButton = (name: "AÑADIR" | "AÑADIDO" = "AÑADIR") =>
  screen.getByRole("button", { name });

describe("ProductDetail", () => {
  it("selects the first color by default and keeps AÑADIR disabled until storage is chosen", () => {
    renderDetail();

    expect(
      screen.getByRole("radio", { name: "Titanium Violet" }),
    ).toBeChecked();
    expect(addButton()).toBeDisabled();
    expect(screen.getByText("From 1229 EUR")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Galaxy S24 Ultra in Titanium Violet" }),
    ).toHaveAttribute("src", expect.stringContaining("s24-violet.webp"));
  });

  it("changes image and selected color when another swatch is chosen", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("radio", { name: "Titanium Black" }));

    expect(screen.getByRole("radio", { name: "Titanium Black" })).toBeChecked();
    expect(
      screen.getByRole("img", { name: "Galaxy S24 Ultra in Titanium Black" }),
    ).toHaveAttribute("src", expect.stringContaining("s24-black.webp"));
  });

  it("updates price by storage and adds the selected configuration to cart", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("radio", { name: "1 TB" }));
    expect(screen.getByText("1529 EUR")).toBeInTheDocument();
    expect(addButton()).toBeEnabled();

    await user.click(addButton());

    expect(
      screen.getByRole("link", { name: "Shopping bag, 1 item" }),
    ).toBeInTheDocument();
    expect(addButton("AÑADIDO")).toBeInTheDocument();
    const storedItems = loadCart();
    expect(storedItems).toHaveLength(1);
    expect(storedItems[0]?.storage).toEqual({ capacity: "1 TB", price: 1529 });
    expect(storedItems[0]?.product.imageUrl).toBe(
      "https://phones.example.test/images/s24-violet.webp",
    );
  });

  it("lets keyboard users move through storage options with the arrow keys", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("radio", { name: "256 GB" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "512 GB" })).toBeChecked();
    expect(screen.getByText("1329 EUR")).toBeInTheDocument();
  });

  it("links back to the catalog keeping the search that led here", () => {
    renderDetail("galaxy");

    expect(screen.getByRole("link", { name: /BACK/ })).toHaveAttribute(
      "href",
      "/?search=galaxy",
    );
    expect(
      screen.getByRole("link", { name: "Samsung Galaxy A25 5G, 239 EUR" }),
    ).toHaveAttribute("href", "/product/SMG-A25?search=galaxy");
  });

  it("links back to the plain catalog when there was no search", () => {
    renderDetail();

    expect(screen.getByRole("link", { name: /BACK/ })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("has no detected accessibility violations", async () => {
    const { container } = renderDetail();

    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });

    expect(results.violations).toEqual([]);
  });
});
