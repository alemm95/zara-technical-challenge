import styles from "./Catalog.module.css";
import { CatalogSearchSkeleton } from "./CatalogSearch";
import { ProductGridSkeleton } from "./ProductGrid";

export function CatalogLoading() {
  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <CatalogSearchSkeleton />
        <ProductGridSkeleton />
      </main>
    </div>
  );
}
