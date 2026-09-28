"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { buildProductHref } from "@/utils/catalogSearch";
import { formatPrice } from "@/utils/money";
import styles from "./CartView.module.css";

export function CartView() {
  const { isHydrated, items, removeItem, totalPrice } = useCart();

  if (!isHydrated) {
    return <main className={styles.page} aria-busy="true" />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>CART ({items.length})</h1>

        {items.length > 0 && (
          <ul className={styles.items}>
            {items.map((item, index) => {
              const productHref = buildProductHref(item.product.id);

              return (
                <li className={styles.item} key={item.id}>
                  <Link
                    aria-label={`${item.product.brand} ${item.product.name}`}
                    className={styles.imageLink}
                    href={productHref}
                  >
                    <Image
                      alt={`${item.product.brand} ${item.product.name} in ${item.color.name}`}
                      className={styles.image}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 768px) 262px, 160px"
                      src={item.color.imageUrl || item.product.imageUrl}
                    />
                  </Link>
                  <div className={styles.itemDetails}>
                    <div className={styles.info}>
                      <div className={styles.configuration}>
                        <div className={styles.brandName}>
                          <Link className={styles.brand} href={productHref}>
                            {item.product.brand}
                          </Link>
                          <Link
                            className={styles.productName}
                            href={productHref}
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <p className={styles.variant}>
                          {item.storage.capacity} | {item.color.name}
                        </p>
                      </div>
                      <p className={styles.itemPrice}>
                        {formatPrice(item.storage.price)}
                      </p>
                    </div>
                    <button
                      aria-label={`Eliminar ${item.product.brand} ${item.product.name}, ${item.storage.capacity} ${item.color.name}`}
                      className={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <footer className={styles.footer}>
          <Link className={styles.continueLink} href="/">
            CONTINUE SHOPPING
          </Link>
          {items.length > 0 && (
            <div className={styles.summary}>
              <p className={styles.total}>
                <span>TOTAL</span>
                <strong>{formatPrice(totalPrice)}</strong>
              </p>
              <button className={styles.payButton} disabled type="button">
                PAY
              </button>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
