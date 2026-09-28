import Image from "next/image";
import type { ProductSummary } from "@/types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: ProductSummary;
  eager?: boolean;
}

export function ProductCard({ product, eager = false }: ProductCardProps) {
  return (
    <a
      aria-label={`${product.brand} ${product.name}, ${product.basePrice} EUR`}
      className={styles.cardLink}
      href={`/product/${encodeURIComponent(product.id)}`}
    >
      <div className={styles.imageFrame}>
        <Image
          alt={product.name}
          className={styles.image}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw"
          src={product.imageUrl}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.brandName}>
          <p className={styles.brand}>{product.brand}</p>
          <p className={styles.name}>{product.name}</p>
        </div>
        <p className={styles.price}>{product.basePrice} EUR</p>
      </div>
    </a>
  );
}
