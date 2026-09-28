import type { ProductSummary } from "@/types/product";
import styles from "./CatalogResults.module.css";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";

export type CatalogRequestState = "idle" | "loading" | "error";

interface CatalogResultsProps {
  products: ProductSummary[];
  requestState: CatalogRequestState;
  onRetry: () => void;
}

export function CatalogResults({
  products,
  requestState,
  onRetry,
}: CatalogResultsProps) {
  return (
    <section
      aria-busy={requestState === "loading"}
      aria-label="Phone results"
      className={styles.results}
    >
      {requestState === "loading" ? (
        <ProductGridSkeleton />
      ) : requestState === "error" ? (
        <div className={styles.statusPanel} role="alert">
          <p className={styles.statusMessage}>
            We couldn&apos;t load the phones. Please try again.
          </p>
          <button
            className={styles.retryButton}
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className={styles.statusPanel} role="status">
          <span className={styles.statusMessage}>No smartphones found.</span>
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
