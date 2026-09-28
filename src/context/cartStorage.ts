import type { CartItem } from "@/types/cart";

export const CART_STORAGE_KEY = "mbst-cart";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProductSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.brand === "string" &&
    typeof value.name === "string" &&
    typeof value.basePrice === "number" &&
    typeof value.imageUrl === "string"
  );
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isProductSummary(value.product) &&
    isRecord(value.color) &&
    typeof value.color.name === "string" &&
    typeof value.color.hexCode === "string" &&
    typeof value.color.imageUrl === "string" &&
    isRecord(value.storage) &&
    typeof value.storage.capacity === "string" &&
    typeof value.storage.price === "number" &&
    Number.isFinite(value.storage.price)
  );
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadCart(storage = getStorage()): CartItem[] {
  if (!storage) {
    return [];
  }

  try {
    const serialized = storage.getItem(CART_STORAGE_KEY);
    if (!serialized) {
      return [];
    }

    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validItems = parsed.filter(isCartItem);
    const seenIds = new Set<string>();

    return validItems.filter((item) => {
      if (seenIds.has(item.id)) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[], storage = getStorage()): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
