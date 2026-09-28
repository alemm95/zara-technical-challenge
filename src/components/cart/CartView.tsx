"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./CartView.module.css";

function formatPrice(price: number) {
  return `${price} EUR`;
}

export function CartView() {
  const { isHydrated, items, removeItem, totalPrice } = useCart();

  if (!isHydrated) {
    return <main className={styles.page} aria-busy="true" />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>CART ({items.length})</h1>

        {items.length > 0 ? (
          <ul className={styles.items}>
            {items.map((item) => (
              <li className={styles.item} key={item.id}>
                <Link
                  aria-label={`${item.product.brand} ${item.product.name}`}
                  className={styles.imageLink}
                  href={`/product/${encodeURIComponent(item.product.id)}`}
                >
                  <Image
                    alt={item.product.name}
                    className={styles.image}
                    fill
                    sizes="160px"
                    src={item.color.imageUrl || item.product.imageUrl}
                  />
                </Link>
                <div className={styles.itemDetails}>
                  <div className={styles.info}>
                    <div className={styles.configuration}>
                      <div className={styles.brandName}>
                        <p className={styles.brand}>{item.product.brand}</p>
                        <Link
                          className={styles.productName}
                          href={`/product/${encodeURIComponent(item.product.id)}`}
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
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState} />
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
