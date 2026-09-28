"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/types/product";
import styles from "./Catalog.module.css";
import { CatalogHeader } from "./CatalogHeader";
import { type CatalogRequestState, CatalogResults } from "./CatalogResults";
import { CatalogSearch } from "./CatalogSearch";

interface CatalogProps {
  initialProducts: ProductSummary[];
  initialError: boolean;
}

interface ProductResponse {
  products: ProductSummary[];
  count: number;
}

export function Catalog({ initialProducts, initialError }: CatalogProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [count, setCount] = useState(initialProducts.length);
  const [requestState, setRequestState] = useState<CatalogRequestState>(
    initialError ? "error" : "idle",
  );
  const [retryCount, setRetryCount] = useState(0);
  const lastRequestKey = useRef(JSON.stringify([query, retryCount]));

  useEffect(() => {
    const requestKey = JSON.stringify([query, retryCount]);
    if (lastRequestKey.current === requestKey) {
      return;
    }

    lastRequestKey.current = requestKey;
    const controller = new AbortController();
    const normalizedQuery = query.trim();
    const timeoutId = window.setTimeout(async () => {
      setRequestState("loading");
      const searchParams = new URLSearchParams({ limit: "20", offset: "0" });

      if (normalizedQuery) {
        searchParams.set("search", normalizedQuery);
      }

      try {
        const url = new URL(
          `/api/products?${searchParams.toString()}`,
          window.location.origin,
        );
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Catalog request failed.");
        }

        const result = (await response.json()) as ProductResponse;
        setProducts(result.products);
        setCount(result.count);
        setRequestState("idle");
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setProducts([]);
        setCount(0);
        setRequestState("error");
      }
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, retryCount]);

  return (
    <div className={styles.page}>
      <CatalogHeader />
      <main className={styles.content}>
        <CatalogSearch
          onQueryChange={setQuery}
          query={query}
          resultCount={count}
        />
        <CatalogResults
          onRetry={() => setRetryCount((value) => value + 1)}
          products={products}
          requestState={requestState}
        />
      </main>
    </div>
  );
}
