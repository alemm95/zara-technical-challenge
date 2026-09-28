import { ProductCard } from "@/components/catalog/ProductCard";
import { ScrollableRow } from "@/components/ScrollableRow";
import type { ProductSummary } from "@/types/product";
import styles from "./SimilarProducts.module.css";

interface SimilarProductsProps {
  products: ProductSummary[];
  search?: string;
}

export function SimilarProducts({ products, search }: SimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  const occurrences = new Map<string, number>();

  return (
    <section
      aria-labelledby="similar-products-title"
      className={styles.section}
    >
      <h2 className={styles.title} id="similar-products-title">
        SIMILAR ITEMS
      </h2>
      <ScrollableRow ariaLabel="Scrollable list of similar phones">
        <ul className={styles.list}>
          {products.map((product) => {
            const occurrence = (occurrences.get(product.id) ?? 0) + 1;
            occurrences.set(product.id, occurrence);

            return (
              <li className={styles.item} key={`${product.id}-${occurrence}`}>
                <ProductCard
                  product={product}
                  search={search}
                  sizes="(min-width: 768px) 377px, 344px"
                />
              </li>
            );
          })}
        </ul>
      </ScrollableRow>
    </section>
  );
}
