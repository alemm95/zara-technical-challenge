import type { ProductDetail as Product } from "@/types/product";
import styles from "./ProductSpecifications.module.css";

const specificationLabels: Record<keyof Product["specs"], string> = {
  screen: "SCREEN",
  resolution: "RESOLUTION",
  processor: "PROCESSOR",
  mainCamera: "MAIN CAMERA",
  selfieCamera: "SELFIE CAMERA",
  battery: "BATTERY",
  os: "OS",
  screenRefreshRate: "SCREEN REFRESH RATE",
};

interface ProductSpecificationsProps {
  product: Product;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  return (
    <section aria-labelledby="specifications-title" className={styles.section}>
      <h2 className={styles.title} id="specifications-title">
        SPECIFICATIONS
      </h2>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt>BRAND</dt>
          <dd>{product.brand}</dd>
        </div>
        <div className={styles.row}>
          <dt>NAME</dt>
          <dd>{product.name}</dd>
        </div>
        <div className={styles.row}>
          <dt>DESCRIPTION</dt>
          <dd>{product.description}</dd>
        </div>
        {Object.entries(product.specs).map(([key, value]) => (
          <div className={styles.row} key={key}>
            <dt>{specificationLabels[key as keyof Product["specs"]] ?? key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
