import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { CartProvider } from "@/context/CartContext";
import { server } from "@/test/server";
import type { ProductSummary } from "@/types/product";
import { Catalog } from "./Catalog";

const firstPhone: ProductSummary = {
  id: "SMG-S24U",
  brand: "Samsung",
  name: "Galaxy S24 Ultra",
  basePrice: 1329,
  imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
};

const secondPhone: ProductSummary = {
  id: "APL-I15P",
  brand: "Apple",
  name: "iPhone 15 Pro",
  basePrice: 1219,
  imageUrl: "https://phones.example.test/images/APL-I15P.webp",
};

function renderCatalog(
  initialProducts: ProductSummary[],
  initialError: boolean,
) {
  return render(
    <CartProvider>
      <Catalog initialProducts={initialProducts} initialError={initialError} />
    </CartProvider>,
  );
}

describe("Catalog", () => {
  it("renders the initial catalog and has no detected accessibility violations", async () => {
    const { container } = renderCatalog([firstPhone], false);

    expect(screen.getByText("1 RESULTS")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Samsung Galaxy S24 Ultra, 1329 EUR",
      }),
    ).toHaveAttribute("href", "/product/SMG-S24U");
    expect(
      screen.getByRole("img", { name: "Galaxy S24 Ultra" }),
    ).toHaveAttribute("src", expect.stringContaining("SMG-S24U.webp"));

    const accessibilityResults = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });

    expect(accessibilityResults.violations).toEqual([]);
  });

  it("sends the search term to the API and displays the returned count", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("search")).toBe("Apple");
        expect(url.searchParams.get("limit")).toBe("20");
        expect(url.searchParams.get("offset")).toBe("0");

        return HttpResponse.json({ products: [secondPhone], count: 1 });
      }),
    );

    renderCatalog([firstPhone], false);
    await user.type(
      screen.getByRole("textbox", {
        name: "Search for a smartphone by name or brand",
      }),
      "Apple",
    );

    expect(
      await screen.findByRole("link", {
        name: "Apple iPhone 15 Pro, 1219 EUR",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 RESULTS")).toBeInTheDocument();
  });

  it("clears the search using the external clear button", async () => {
    const user = userEvent.setup();
    renderCatalog([firstPhone], false);

    const searchInput = screen.getByRole("textbox", {
      name: "Search for a smartphone by name or brand",
    });
    await user.type(searchInput, "Apple");
    await user.click(
      await screen.findByRole("button", { name: "Clear search" }),
    );

    expect(searchInput).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("shows loading feedback while a search request is pending", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", async () => {
        await delay(120);
        return HttpResponse.json({ products: [], count: 0 });
      }),
    );

    renderCatalog([firstPhone], false);
    await user.type(
      screen.getByRole("textbox", {
        name: "Search for a smartphone by name or brand",
      }),
      "Pixel",
    );

    expect(
      await screen.findByRole("status", { name: "Loading phones" }),
    ).toBeVisible();
    expect(await screen.findByText("No smartphones found.")).toBeVisible();
  });

  it("shows a recoverable error and retries the API request", async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    server.use(
      http.get("*/api/products", () => {
        requestCount += 1;
        return HttpResponse.json({ products: [secondPhone], count: 1 });
      }),
    );

    render(
      <StrictMode>
        <CartProvider>
          <Catalog initialProducts={[]} initialError />
        </CartProvider>
      </StrictMode>,
    );
    expect(
      screen.getByText("We couldn't load the phones. Please try again."),
    ).toBeVisible();
    expect(requestCount).toBe(0);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: "Apple iPhone 15 Pro, 1219 EUR",
        }),
      ).toBeInTheDocument();
    });
    expect(requestCount).toBe(1);
  });

  it("shows an error when an API search request fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", () =>
        HttpResponse.json({ message: "Unavailable" }, { status: 502 }),
      ),
    );

    renderCatalog([firstPhone], false);
    await user.type(
      screen.getByRole("textbox", {
        name: "Search for a smartphone by name or brand",
      }),
      "Pixel",
    );

    expect(
      await screen.findByText("We couldn't load the phones. Please try again."),
    ).toBeVisible();
  });

  it("shows an empty state when the API returns no matching products", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", () =>
        HttpResponse.json({ products: [], count: 0 }),
      ),
    );

    renderCatalog([firstPhone], false);
    await user.type(
      screen.getByRole("textbox", {
        name: "Search for a smartphone by name or brand",
      }),
      "nothing",
    );

    expect(await screen.findByText("No smartphones found.")).toBeVisible();
    expect(screen.getByText("0 RESULTS")).toBeInTheDocument();
  });
});
