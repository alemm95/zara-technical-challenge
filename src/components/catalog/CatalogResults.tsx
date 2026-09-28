import { LoadingBar } from "@/components/LoadingBar";
import type { ProductSummary } from "@/types/product";
import styles from "./CatalogResults.module.css";
import { ProductGrid } from "./ProductGrid";

export type CatalogRequestState = "idle" | "loading" | "error";

interface CatalogResultsProps {
  products: ProductSummary[];
  requestState: CatalogRequestState;
  search?: string;
  onRetry: () => void;
}

export function CatalogResults({
  products,
  requestState,
  search,
  onRetry,
}: CatalogResultsProps) {
  const isLoading = requestState === "loading";

  return (
    <>
      {isLoading && <LoadingBar label="Loading phones" />}
      <section
        aria-busy={isLoading}
        aria-label="Phone results"
        className={styles.results}
      >
        {requestState === "error" ? (
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
        ) : products.length === 0 && !isLoading ? (
          <p className={styles.statusPanel} role="status">
            <span className={styles.statusMessage}>No smartphones found.</span>
          </p>
        ) : (
          <ProductGrid products={products} search={search} />
        )}
      </section>
    </>
  );
}
