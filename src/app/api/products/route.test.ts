import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProducts } from "@/services/productService";
import type { ProductSummary } from "@/types/product";
import { GET } from "./route";

vi.mock("@/services/productService", () => ({ getProducts: vi.fn() }));

const products: ProductSummary[] = [
  {
    id: "SMG-S24U",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1329,
    imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
  },
];

beforeEach(() => {
  vi.mocked(getProducts).mockResolvedValue(products);
});

function request(query = "") {
  return new Request(`http://localhost/api/products${query}`);
}

describe("GET /api/products", () => {
  it("returns the first page of 20 products with their count", async () => {
    const response = await GET(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ products, count: 1 });
    expect(getProducts).toHaveBeenCalledWith({
      search: undefined,
      limit: 20,
      offset: 0,
    });
  });

  it("forwards search and offset but never exceeds 20 results", async () => {
    await GET(request("?limit=100&offset=40&search=apple"));

    expect(getProducts).toHaveBeenCalledWith({
      search: "apple",
      limit: 20,
      offset: 40,
    });
  });

  it("falls back to safe defaults for invalid pagination", async () => {
    await GET(request("?limit=abc&offset=-5"));
    await GET(request("?limit=0"));

    expect(getProducts).toHaveBeenNthCalledWith(1, {
      search: undefined,
      limit: 20,
      offset: 0,
    });
    expect(getProducts).toHaveBeenNthCalledWith(2, {
      search: undefined,
      limit: 20,
      offset: 0,
    });
  });

  it("answers 502 without leaking upstream details when the API fails", async () => {
    vi.mocked(getProducts).mockRejectedValue(new Error("upstream secret"));

    const response = await GET(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: "Unable to load the catalog.",
    });
  });
});
