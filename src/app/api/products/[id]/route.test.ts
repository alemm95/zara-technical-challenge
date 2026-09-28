import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import { getProductById } from "@/services/productService";
import type { ProductDetail } from "@/types/product";
import { GET } from "./route";

vi.mock("@/services/productService", () => ({ getProductById: vi.fn() }));

const product = { id: "SMG-S24U", name: "Galaxy S24 Ultra" } as ProductDetail;

function call(id: string) {
  return GET(new Request(`http://localhost/api/products/${id}`), {
    params: Promise.resolve({ id }),
  });
}

beforeEach(() => {
  vi.mocked(getProductById).mockResolvedValue(product);
});

describe("GET /api/products/[id]", () => {
  it("returns the product detail", async () => {
    const response = await call("SMG-S24U");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(product);
    expect(getProductById).toHaveBeenCalledWith("SMG-S24U");
  });

  it("answers 404 when the API reports the product as missing", async () => {
    vi.mocked(getProductById).mockRejectedValue(new ApiError(404));

    const response = await call("missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "Product not found.",
    });
  });

  it("answers 502 for any other failure", async () => {
    vi.mocked(getProductById).mockRejectedValue(new ApiError(500));
    expect((await call("SMG-S24U")).status).toBe(502);

    vi.mocked(getProductById).mockRejectedValue(new Error("boom"));
    expect((await call("SMG-S24U")).status).toBe(502);
  });
});
