import Image from "next/image";
import styles from "./CatalogHeader.module.css";

export function CatalogHeader() {
  return (
    <header className={styles.header}>
      <a aria-label="MBST home" className={styles.brand} href="/">
        <Image alt="" height={15} src="/icons/mbst-logo.svg" width={28} />
        <span className={styles.wordmark}>MBST</span>
      </a>
      <a
        aria-label="Shopping bag, 0 items"
        className={styles.cartLink}
        href="/cart"
      >
        <Image alt="" height={17} src="/icons/bag.svg" width={17} />
        <span aria-hidden="true">0</span>
      </a>
    </header>
  );
}
