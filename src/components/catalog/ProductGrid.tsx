import type { ProductSummary } from "@/types/product";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: ProductSummary[];
  search?: string;
}

export function ProductGrid({ products, search }: ProductGridProps) {
  const occurrences = new Map<string, number>();

  return (
    <ul className={styles.grid}>
      {products.map((product, index) => {
        const occurrence = (occurrences.get(product.id) ?? 0) + 1;
        occurrences.set(product.id, occurrence);

        return (
          <li className={styles.cell} key={`${product.id}-${occurrence}`}>
            <ProductCard product={product} eager={index < 10} search={search} />
          </li>
        );
      })}
    </ul>
  );
}
