import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import CartPage from "@/app/cart/page";
import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";
import Home from "@/app/page";
import ProductPage from "@/app/product/[id]/page";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CartProvider } from "@/context/CartContext";
import { CART_STORAGE_KEY } from "@/context/cartStorage";
import { getProductById, getProducts } from "@/services/productService";
import {
  cartItemFixture,
  productDetailFixture,
  productListFixture,
} from "./fixtures/products";

vi.mock("@/services/productService", () => ({
  getProductById: vi.fn(),
  getProducts: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  notFound: vi.fn(),
}));

// jsdom cannot compute colors, so contrast is reviewed manually against the tokens.
const axeOptions = { rules: { "color-contrast": { enabled: false } } };

async function violationsOf(container: HTMLElement) {
  return (await axe(container, axeOptions)).violations;
}

function inLayout(page: React.ReactNode) {
  return render(
    <CartProvider>
      <CatalogHeader />
      {page}
    </CartProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(getProducts).mockResolvedValue(productListFixture);
  vi.mocked(getProductById).mockResolvedValue(productDetailFixture);
});

describe("accessibility of the real pages (axe)", () => {
  it("catalog page has no violations", async () => {
    const page = await Home({ searchParams: Promise.resolve({}) });
    const { container } = inLayout(page);

    expect(await violationsOf(container)).toEqual([]);
  });

  it("product page has no violations", async () => {
    const page = await ProductPage({
      params: Promise.resolve({ id: productDetailFixture.id }),
      searchParams: Promise.resolve({ search: "galaxy" }),
    });
    const { container } = inLayout(page);

    expect(await violationsOf(container)).toEqual([]);
  });

  it("cart page with items has no violations", async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([cartItemFixture]));
    const { container } = inLayout(<CartPage />);
    await screen.findByRole("heading", { name: "CART (1)" });

    expect(await violationsOf(container)).toEqual([]);
  });

  it("not-found and error pages have no violations", async () => {
    const notFound = inLayout(<NotFound />);
    expect(await violationsOf(notFound.container)).toEqual([]);
    notFound.unmount();

    const error = inLayout(<ErrorPage retry={() => undefined} />);
    expect(await violationsOf(error.container)).toEqual([]);
  });
});
