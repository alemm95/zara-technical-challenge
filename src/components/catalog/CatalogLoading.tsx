import styles from "./Catalog.module.css";
import { CatalogHeader } from "./CatalogHeader";
import { CatalogSearchSkeleton } from "./CatalogSearch";
import { ProductGridSkeleton } from "./ProductGrid";

export function CatalogLoading() {
  return (
    <div className={styles.page}>
      <CatalogHeader />
      <main className={styles.content}>
        <CatalogSearchSkeleton />
        <ProductGridSkeleton />
      </main>
    </div>
  );
}
