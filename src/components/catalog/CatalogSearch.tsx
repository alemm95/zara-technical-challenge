import Image from "next/image";
import styles from "./CatalogSearch.module.css";

interface CatalogSearchProps {
  query: string;
  resultCount: number;
  onQueryChange: (query: string) => void;
}

export function CatalogSearch({
  query,
  resultCount,
  onQueryChange,
}: CatalogSearchProps) {
  return (
    <section aria-label="Catalog controls" className={styles.section}>
      <form
        aria-label="Phone catalog search"
        className={styles.form}
        onSubmit={(event) => event.preventDefault()}
      >
        <label className={styles.srOnly} htmlFor="catalog-search">
          Search for a smartphone by name or brand
        </label>
        <input
          autoComplete="off"
          className={styles.input}
          id="catalog-search"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder="Search for a smartphone..."
          type="text"
          value={query}
        />
        {query && (
          <button
            aria-label="Clear search"
            className={styles.clearButton}
            onClick={() => onQueryChange("")}
            type="button"
          >
            <Image alt="" height={20} src="/icons/close.svg" width={20} />
          </button>
        )}
      </form>
      <p aria-live="polite" className={styles.resultCount} role="status">
        {resultCount} RESULTS
      </p>
    </section>
  );
}

export function CatalogSearchSkeleton() {
  return (
    <section aria-label="Catalog controls" className={styles.section}>
      <div aria-hidden="true" className={styles.skeleton} />
      <p className={styles.resultCount}>20 RESULTS</p>
    </section>
  );
}
