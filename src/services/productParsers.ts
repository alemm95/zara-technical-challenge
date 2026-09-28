import type { ProductDetail, ProductSummary } from "@/types/product";
import { isProductDetail, isProductSummaryList } from "@/types/productGuards";
import { toHttps } from "@/utils/url";

function secureSummary(product: ProductSummary): ProductSummary {
  return { ...product, imageUrl: toHttps(product.imageUrl) };
}

export function parseProductList(payload: unknown): ProductSummary[] {
  if (!isProductSummaryList(payload)) {
    throw new Error("Unexpected products response from the API.");
  }

  return payload.map(secureSummary);
}

export function parseProductDetail(payload: unknown): ProductDetail {
  if (!isProductDetail(payload)) {
    throw new Error("Unexpected product response from the API.");
  }

  return {
    ...payload,
    imageUrl: payload.imageUrl ? toHttps(payload.imageUrl) : undefined,
    colorOptions: payload.colorOptions.map((color) => ({
      ...color,
      imageUrl: toHttps(color.imageUrl),
    })),
    similarProducts: payload.similarProducts.map(secureSummary),
  };
}
