import { delay, HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/server";
import { ApiError } from "./apiClient";
import { getProductById, getProducts } from "./productService";

const apiOrigin = "https://phones.example.test";
const apiKey = "test-api-key";

beforeEach(() => {
  vi.stubEnv("PHONES_API_BASE_URL", apiOrigin);
  vi.stubEnv("PHONES_API_KEY", apiKey);
});

describe("getProducts", () => {
  it("sends search and pagination parameters with the API key", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, ({ request }) => {
        const url = new URL(request.url);

        expect(request.headers.get("x-api-key")).toBe(apiKey);
        expect(url.searchParams.get("search")).toBe("Samsung S24");
        expect(url.searchParams.get("limit")).toBe("5");
        expect(url.searchParams.get("offset")).toBe("10");

        return HttpResponse.json([
          {
            id: "SMG-S24U",
            brand: "Samsung",
            name: "Galaxy S24 Ultra",
            basePrice: 1329,
            imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
          },
        ]);
      }),
    );

    await expect(
      getProducts({ search: "  Samsung S24  ", limit: 5, offset: 10 }),
    ).resolves.toEqual([
      {
        id: "SMG-S24U",
        brand: "Samsung",
        name: "Galaxy S24 Ultra",
        basePrice: 1329,
        imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
      },
    ]);
  });

  it("uses the first page of 20 products by default", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get("limit")).toBe("20");
        expect(url.searchParams.get("offset")).toBe("0");
        expect(url.searchParams.has("search")).toBe(false);

        return HttpResponse.json([]);
      }),
    );

    await expect(getProducts()).resolves.toEqual([]);
  });

  it("surfaces HTTP errors without exposing the response body", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, () =>
        HttpResponse.json({ message: "internal details" }, { status: 503 }),
      ),
    );

    await expect(getProducts()).rejects.toThrow(
      "API request failed with status 503.",
    );
  });

  it("requires server API configuration", async () => {
    vi.stubEnv("PHONES_API_BASE_URL", "");

    await expect(getProducts()).rejects.toThrow(
      "PHONES_API_BASE_URL and PHONES_API_KEY must be configured.",
    );
  });

  it("exposes the HTTP status through ApiError", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, () =>
        HttpResponse.json({}, { status: 503 }),
      ),
    );

    await expect(getProducts()).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
    });
    await expect(getProducts()).rejects.toBeInstanceOf(ApiError);
  });

  it("upgrades http image URLs to https", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, () =>
        HttpResponse.json([
          {
            id: "SMG-S24U",
            brand: "Samsung",
            name: "Galaxy S24 Ultra",
            basePrice: 1329,
            imageUrl: "http://phones.example.test/images/SMG-S24U.webp",
          },
        ]),
      ),
    );

    const [product] = await getProducts();

    expect(product?.imageUrl).toBe(
      "https://phones.example.test/images/SMG-S24U.webp",
    );
  });

  it("maps a network failure to a 502 ApiError", async () => {
    server.use(http.get(`${apiOrigin}/products`, () => HttpResponse.error()));

    await expect(getProducts()).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
    });
  });

  it("maps a timeout to a 504 ApiError", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, async () => {
        await delay(200);
        return HttpResponse.json([]);
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      AbortSignal.abort(new DOMException("timeout", "TimeoutError")),
    );

    await expect(getProducts()).rejects.toMatchObject({
      name: "ApiError",
      status: 504,
    });
  });

  it("rejects payloads that are not a product list", async () => {
    server.use(
      http.get(`${apiOrigin}/products`, () =>
        HttpResponse.json([{ id: "SMG-S24U" }]),
      ),
    );

    await expect(getProducts()).rejects.toThrow(
      "Unexpected products response from the API.",
    );
  });
});

describe("getProductById", () => {
  it("loads product detail by encoded id and sends the API key", async () => {
    server.use(
      http.get(`${apiOrigin}/products/:id`, ({ params, request }) => {
        expect(params.id).toBe("SMG-S24U");
        expect(request.headers.get("x-api-key")).toBe(apiKey);

        return HttpResponse.json({
          id: "SMG-S24U",
          brand: "Samsung",
          name: "Galaxy S24 Ultra",
          basePrice: 1329,
          imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
          description: "A test phone",
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
              imageUrl: "https://phones.example.test/images/violet.webp",
            },
          ],
          storageOptions: [{ capacity: "256 GB", price: 1229 }],
          similarProducts: [],
        });
      }),
    );

    const product = await getProductById("SMG-S24U");

    expect(product.id).toBe("SMG-S24U");
    expect(product.colorOptions[0]?.name).toBe("Titanium Violet");
    expect(product.storageOptions[0]?.price).toBe(1229);
  });

  it("rejects an empty product id without making a request", async () => {
    await expect(getProductById(" ")).rejects.toThrow(
      "Product id is required.",
    );
  });

  it("reports a missing product as ApiError 404", async () => {
    server.use(
      http.get(`${apiOrigin}/products/:id`, () =>
        HttpResponse.json({}, { status: 404 }),
      ),
    );

    await expect(getProductById("missing")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("rejects payloads that are not a product detail", async () => {
    server.use(
      http.get(`${apiOrigin}/products/:id`, () =>
        HttpResponse.json({ id: "SMG-S24U", name: "Galaxy S24 Ultra" }),
      ),
    );

    await expect(getProductById("SMG-S24U")).rejects.toThrow(
      "Unexpected product response from the API.",
    );
  });
});
