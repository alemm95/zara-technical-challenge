"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/types/product";
import { isProductListResponse } from "@/types/productGuards";
import {
  buildCatalogHref,
  normalizeCatalogSearch,
} from "@/utils/catalogSearch";
import styles from "./Catalog.module.css";
import { type CatalogRequestState, CatalogResults } from "./CatalogResults";
import { CatalogSearch } from "./CatalogSearch";

const SEARCH_DEBOUNCE_MS = 280;

interface CatalogProps {
  initialProducts: ProductSummary[];
  initialSearch?: string;
}

export function Catalog({ initialProducts, initialSearch = "" }: CatalogProps) {
  const startingSearch = normalizeCatalogSearch(initialSearch);
  const [query, setQuery] = useState(startingSearch);
  const [products, setProducts] = useState(initialProducts);
  const [resultsSearch, setResultsSearch] = useState(startingSearch);
  const [count, setCount] = useState(initialProducts.length);
  const [requestState, setRequestState] = useState<CatalogRequestState>("idle");
  const [retryCount, setRetryCount] = useState(0);
  const lastRequestKey = useRef(JSON.stringify([startingSearch, 0]));

  useEffect(() => {
    const term = normalizeCatalogSearch(query);
    const requestKey = JSON.stringify([term, retryCount]);
    if (lastRequestKey.current === requestKey) {
      return;
    }

    lastRequestKey.current = requestKey;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      window.history.replaceState(null, "", buildCatalogHref(term));
      setRequestState("loading");
      const searchParams = new URLSearchParams({ limit: "20", offset: "0" });

      if (term) {
        searchParams.set("search", term);
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

        const result: unknown = await response.json();
        if (!isProductListResponse(result)) {
          throw new Error("Unexpected catalog response.");
        }

        setProducts(result.products);
        setCount(result.count);
        setResultsSearch(term);
        setRequestState("idle");
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setProducts([]);
        setCount(0);
        setRequestState("error");
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, retryCount]);

  return (
    <div className={styles.page}>
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
          search={resultsSearch}
        />
      </main>
    </div>
  );
}
