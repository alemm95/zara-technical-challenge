import Link from "next/link";
import type { ProductDetail as Product } from "@/types/product";
import { buildCatalogHref } from "@/utils/catalogSearch";
import { ProductConfigurator } from "./ProductConfigurator";
import styles from "./ProductDetailLayout.module.css";
import { ProductSpecifications } from "./ProductSpecifications";
import { SimilarProducts } from "./SimilarProducts";

interface ProductDetailProps {
  product: Product;
  search?: string;
}

export function ProductDetail({ product, search = "" }: ProductDetailProps) {
  const { id, brand, name, basePrice, imageUrl, colorOptions, storageOptions } =
    product;

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <nav aria-label="Product navigation" className={styles.backBar}>
          <Link className={styles.backLink} href={buildCatalogHref(search)}>
            <span aria-hidden="true">‹</span> BACK
          </Link>
        </nav>

        <section aria-label={`${brand} ${name}`} className={styles.hero}>
          <ProductConfigurator
            key={id}
            product={{
              id,
              brand,
              name,
              basePrice,
              imageUrl,
              colorOptions,
              storageOptions,
            }}
          />
        </section>

        <ProductSpecifications product={product} />
        <SimilarProducts products={product.similarProducts} search={search} />
      </main>
    </div>
  );
}
