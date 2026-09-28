import type { CartItem } from "@/types/cart";

export interface CartState {
  items: CartItem[];
  hydrated: boolean;
}

export type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: CartItem }
  | { type: "remove"; itemId: string }
  | { type: "clear" };

export const initialCartState: CartState = {
  items: [],
  hydrated: false,
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };
    case "add":
      return { ...state, items: [...state.items, action.item] };
    case "remove":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.itemId),
      };
    case "clear":
      return { ...state, items: [] };
    default: {
      const exhaustiveAction: never = action;
      return exhaustiveAction;
    }
  }
}
