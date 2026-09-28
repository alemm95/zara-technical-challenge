import Link from "next/link";
import styles from "./ProductDetailLayout.module.css";

export function ProductDetailLoading() {
  return (
    <div className={styles.page}>
      <nav aria-label="Product navigation" className={styles.backBar}>
        <Link className={styles.backLink} href="/">
          <span aria-hidden="true">‹</span> BACK
        </Link>
      </nav>
      <main aria-busy="true" className={styles.loading}>
        <p role="status">Loading product details...</p>
      </main>
    </div>
  );
}
