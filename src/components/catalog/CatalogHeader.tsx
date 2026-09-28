"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import styles from "./CatalogHeader.module.css";

export function CatalogHeader() {
  const { isHydrated, totalItems } = useCart();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <nav aria-label="Main navigation" className={styles.nav}>
        <Link aria-label="MBST home" className={styles.brand} href="/">
          <Image alt="" height={15} src="/icons/mbst-logo.svg" width={28} />
          <span className={styles.wordmark}>MBST</span>
        </Link>
        {pathname !== "/cart" && (
          <Link
            aria-label={
              isHydrated
                ? `Shopping bag, ${totalItems} ${totalItems === 1 ? "item" : "items"}`
                : "Shopping bag"
            }
            className={styles.cartLink}
            href="/cart"
          >
            <Image alt="" height={18} src="/icons/bag.svg" width={18} />
            <span
              aria-hidden="true"
              className={styles.cartCount}
              data-hydrated={isHydrated}
            >
              {isHydrated ? totalItems : ""}
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
}
