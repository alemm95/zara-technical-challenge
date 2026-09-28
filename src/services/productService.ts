import "server-only";
import type { ProductDetail, ProductSummary } from "@/types/product";
import { apiRequest } from "./apiClient";
import { parseProductDetail, parseProductList } from "./productParsers";

export interface GetProductsOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getProducts({
  search,
  limit = 20,
  offset = 0,
}: GetProductsOptions = {}): Promise<ProductSummary[]> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    query.set("search", normalizedSearch);
  }

  return parseProductList(await apiRequest<unknown>(`products?${query}`));
}

export async function getProductById(id: string): Promise<ProductDetail> {
  if (!id.trim()) {
    throw new Error("Product id is required.");
  }

  return parseProductDetail(
    await apiRequest<unknown>(`products/${encodeURIComponent(id)}`),
  );
}
