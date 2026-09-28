import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
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

const searchbox = () =>
  screen.getByRole("textbox", {
    name: "Search for a smartphone by name or brand",
  });

function renderCatalog(initialProducts: ProductSummary[], initialSearch = "") {
  return render(
    <CartProvider>
      <Catalog
        initialProducts={initialProducts}
        initialSearch={initialSearch}
      />
    </CartProvider>,
  );
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("Catalog", () => {
  it("renders the initial catalog and has no detected accessibility violations", async () => {
    const { container } = renderCatalog([firstPhone]);

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

  it("starts from the search in the URL without requesting it again", () => {
    renderCatalog([secondPhone], "Apple");

    expect(searchbox()).toHaveValue("Apple");
    expect(
      screen.getByRole("link", { name: "Apple iPhone 15 Pro, 1219 EUR" }),
    ).toHaveAttribute("href", "/product/APL-I15P?search=Apple");
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

    renderCatalog([firstPhone]);
    await user.type(searchbox(), "Apple");

    expect(
      await screen.findByRole("link", {
        name: "Apple iPhone 15 Pro, 1219 EUR",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 RESULTS")).toBeInTheDocument();
  });

  it("reflects the committed search in the URL and in product links", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", () =>
        HttpResponse.json({ products: [secondPhone], count: 1 }),
      ),
    );

    renderCatalog([firstPhone]);
    await user.type(searchbox(), "Apple");

    expect(
      await screen.findByRole("link", { name: /iPhone 15 Pro/ }),
    ).toHaveAttribute("href", "/product/APL-I15P?search=Apple");
    expect(window.location.search).toBe("?search=Apple");
  });

  it("clears the search using the external clear button and restores the plain URL", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", ({ request }) =>
        HttpResponse.json({
          products: new URL(request.url).searchParams.has("search")
            ? [secondPhone]
            : [firstPhone],
          count: 1,
        }),
      ),
    );
    renderCatalog([firstPhone]);

    await user.type(searchbox(), "Apple");
    await screen.findByRole("link", { name: /iPhone 15 Pro/ });
    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(searchbox()).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    expect(
      await screen.findByRole("link", { name: /Galaxy S24 Ultra/ }),
    ).toHaveAttribute("href", "/product/SMG-S24U");
    expect(window.location.search).toBe("");
  });

  it("keeps the previous results and shows the loading bar while searching", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", async () => {
        await delay(120);
        return HttpResponse.json({ products: [], count: 0 });
      }),
    );

    renderCatalog([firstPhone]);
    await user.type(searchbox(), "Pixel");

    expect(await screen.findByText("Loading phones")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Phone results" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("link", { name: /Galaxy S24 Ultra/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText("No smartphones found.")).toBeVisible();
    expect(screen.queryByText("Loading phones")).toBeNull();
  });

  it("shows a recoverable error and retries the API request", async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    server.use(
      http.get("*/api/products", () => {
        requestCount += 1;
        return requestCount === 1
          ? HttpResponse.json({ message: "Unavailable" }, { status: 502 })
          : HttpResponse.json({ products: [secondPhone], count: 1 });
      }),
    );

    renderCatalog([firstPhone]);
    await user.type(searchbox(), "Apple");

    expect(
      await screen.findByText("We couldn't load the phones. Please try again."),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("link", {
        name: "Apple iPhone 15 Pro, 1219 EUR",
      }),
    ).toBeInTheDocument();
    expect(requestCount).toBe(2);
  });

  it("shows an empty state when the API returns no matching products", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/products", () =>
        HttpResponse.json({ products: [], count: 0 }),
      ),
    );

    renderCatalog([firstPhone]);
    await user.type(searchbox(), "nothing");

    expect(await screen.findByText("No smartphones found.")).toBeVisible();
    expect(screen.getByText("0 RESULTS")).toBeInTheDocument();
  });
});
