"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { CartItem, NewCartItem } from "@/types/cart";
import { cartReducer, initialCartState } from "./cartReducer";
import { loadCart, saveCart } from "./cartStorage";

export interface CartContextValue {
  items: CartItem[];
  isHydrated: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    dispatch({ type: "hydrate", items: loadCart() });
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      saveCart(state.items);
    }
  }, [state.hydrated, state.items]);

  function addItem(item: NewCartItem) {
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({ type: "add", item: { ...item, id } });
  }

  function removeItem(itemId: string) {
    dispatch({ type: "remove", itemId });
  }

  function clearCart() {
    dispatch({ type: "clear" });
  }

  const value: CartContextValue = {
    items: state.items,
    isHydrated: state.hydrated,
    totalItems: state.items.length,
    totalPrice: state.items.reduce(
      (total, item) => total + item.storage.price,
      0,
    ),
    addItem,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
