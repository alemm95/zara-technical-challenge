import type {
  ProductColorOption,
  ProductStorageOption,
  ProductSummary,
} from "./product";

export interface CartItem {
  id: string;
  product: ProductSummary;
  color: ProductColorOption;
  storage: ProductStorageOption;
}

export type NewCartItem = Omit<CartItem, "id">;
