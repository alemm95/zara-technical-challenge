import type { ProductSummary } from "@/types/product";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: ProductSummary[];
}

const skeletonKeys = Array.from(
  { length: 10 },
  (_, index) => `catalog-skeleton-${index + 1}`,
);

export function ProductGrid({ products }: ProductGridProps) {
  const occurrences = new Map<string, number>();

  return (
    <ul className={styles.grid}>
      {products.map((product, index) => {
        const occurrence = (occurrences.get(product.id) ?? 0) + 1;
        occurrences.set(product.id, occurrence);

        return (
          <li className={styles.cell} key={`${product.id}-${occurrence}`}>
            <ProductCard product={product} eager={index < 10} />
          </li>
        );
      })}
    </ul>
  );
}

export function ProductGridSkeleton() {
  return (
    <div
      aria-label="Loading phones"
      className={styles.skeletonGrid}
      role="status"
    >
      {skeletonKeys.map((skeletonKey) => (
        <div
          aria-hidden="true"
          className={styles.skeletonCard}
          key={skeletonKey}
        >
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonText}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        </div>
      ))}
    </div>
  );
}
