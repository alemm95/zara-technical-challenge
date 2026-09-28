import "server-only";
import type { ProductDetail, ProductSummary } from "@/types/product";
import { isProductDetail, isProductSummaryList } from "@/types/productGuards";
import { apiRequest } from "./apiClient";

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

  const products = await apiRequest<unknown>(`products?${query.toString()}`);
  if (!isProductSummaryList(products)) {
    throw new Error("Unexpected products response from the API.");
  }

  return products;
}

export async function getProductById(id: string): Promise<ProductDetail> {
  if (!id.trim()) {
    throw new Error("Product id is required.");
  }

  const product = await apiRequest<unknown>(
    `products/${encodeURIComponent(id)}`,
  );
  if (!isProductDetail(product)) {
    throw new Error("Unexpected product response from the API.");
  }

  return product;
}
