import type { ProductDetail, ProductSummary } from "./product";

export interface ProductListResponse {
  products: ProductSummary[];
  count: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isProductSummary(value: unknown): value is ProductSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.brand === "string" &&
    typeof value.name === "string" &&
    typeof value.basePrice === "number" &&
    typeof value.imageUrl === "string"
  );
}

export function isProductSummaryList(
  value: unknown,
): value is ProductSummary[] {
  return Array.isArray(value) && value.every(isProductSummary);
}

export function isProductListResponse(
  value: unknown,
): value is ProductListResponse {
  return (
    isRecord(value) &&
    typeof value.count === "number" &&
    isProductSummaryList(value.products)
  );
}

function isColorOption(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.hexCode === "string" &&
    typeof value.imageUrl === "string"
  );
}

function isStorageOption(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.capacity === "string" &&
    typeof value.price === "number"
  );
}

export function isProductDetail(value: unknown): value is ProductDetail {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.brand === "string" &&
    typeof value.name === "string" &&
    typeof value.basePrice === "number" &&
    typeof value.description === "string" &&
    isRecord(value.specs) &&
    Array.isArray(value.colorOptions) &&
    value.colorOptions.every(isColorOption) &&
    Array.isArray(value.storageOptions) &&
    value.storageOptions.every(isStorageOption) &&
    isProductSummaryList(value.similarProducts)
  );
}
