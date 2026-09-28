"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type {
  ProductDetail as Product,
  ProductColorOption,
  ProductStorageOption,
} from "@/types/product";
import styles from "./ProductDetailLayout.module.css";
import { ProductSpecifications } from "./ProductSpecifications";
import { SimilarProducts } from "./SimilarProducts";

interface ProductDetailProps {
  initialProduct?: Product;
  initialError?: boolean;
  productId: string;
}

export function ProductDetail({
  initialProduct,
  initialError = false,
  productId,
}: ProductDetailProps) {
  const [product, setProduct] = useState(initialProduct);
  const [selectedColor, setSelectedColor] = useState<ProductColorOption | null>(
    initialProduct?.colorOptions[0] ?? null,
  );
  const [selectedStorage, setSelectedStorage] =
    useState<ProductStorageOption | null>(null);
  const [requestError, setRequestError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const imageUrl = selectedColor?.imageUrl ?? product?.imageUrl;
  const startingPrice = product
    ? product.storageOptions.length > 0
      ? Math.min(...product.storageOptions.map((storage) => storage.price))
      : product.basePrice
    : undefined;

  async function retryLoad() {
    setIsLoading(true);
    setRequestError(false);

    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}`,
      );
      if (!response.ok) {
        throw new Error("Unable to load product details.");
      }

      const loadedProduct = (await response.json()) as Product;
      setProduct(loadedProduct);
      setSelectedColor(loadedProduct.colorOptions[0] ?? null);
      setSelectedStorage(null);
    } catch {
      setRequestError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function selectColor(color: ProductColorOption) {
    setSelectedColor(color);
    setAdded(false);
  }

  function selectStorage(storage: ProductStorageOption) {
    setSelectedStorage(storage);
    setAdded(false);
  }

  function addSelectedProduct() {
    if (!product || !selectedColor || !selectedStorage) {
      return;
    }

    addItem({
      product: {
        id: product.id,
        brand: product.brand,
        name: product.name,
        basePrice: product.basePrice,
        imageUrl: product.imageUrl ?? selectedColor.imageUrl,
      },
      color: selectedColor,
      storage: selectedStorage,
    });
    setAdded(true);
  }

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <nav aria-label="Product navigation" className={styles.backBar}>
          <Link className={styles.backLink} href="/">
            <span aria-hidden="true">‹</span> BACK
          </Link>
        </nav>

        {requestError || !product ? (
          <div className={styles.errorState} role="alert">
            <p>We couldn&apos;t load this phone.</p>
            <button
              className={styles.retryButton}
              disabled={isLoading}
              onClick={retryLoad}
              type="button"
            >
              {isLoading ? "Loading..." : "Retry"}
            </button>
          </div>
        ) : (
          <>
            <section
              aria-label={`${product.brand} ${product.name}`}
              className={styles.hero}
            >
              <div className={styles.heroImage}>
                {imageUrl && (
                  <Image
                    alt={`${product.name}${selectedColor ? ` in ${selectedColor.name}` : ""}`}
                    className={styles.productImage}
                    fill
                    priority
                    sizes="(max-width: 700px) 100vw, 55vw"
                    src={imageUrl}
                  />
                )}
              </div>

              <div className={styles.configuration}>
                <h1 className={styles.productName}>{product.name}</h1>
                <p className={styles.price}>
                  {selectedStorage
                    ? `${selectedStorage.price} EUR`
                    : `From ${startingPrice} EUR`}
                </p>

                <fieldset className={styles.optionGroup}>
                  <legend>STORAGE. HOW MUCH SPACE DO YOU NEED?</legend>
                  <div className={styles.storageOptions}>
                    {product.storageOptions.map((storage) => (
                      <button
                        aria-pressed={
                          selectedStorage?.capacity === storage.capacity
                        }
                        className={styles.storageOption}
                        key={storage.capacity}
                        onClick={() => selectStorage(storage)}
                        type="button"
                      >
                        {storage.capacity}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className={styles.optionGroup}>
                  <legend>COLOR. PICK YOUR FAVOURITE.</legend>
                  {product.colorOptions.length > 0 ? (
                    <>
                      <div className={styles.colorOptions}>
                        {product.colorOptions.map((color) => (
                          <button
                            aria-label={color.name}
                            aria-pressed={selectedColor?.name === color.name}
                            className={styles.colorOption}
                            key={color.name}
                            onClick={() => selectColor(color)}
                            style={{ backgroundColor: color.hexCode }}
                            type="button"
                          />
                        ))}
                      </div>
                      <p aria-live="polite" className={styles.selectedColor}>
                        {selectedColor?.name}
                      </p>
                    </>
                  ) : (
                    <p className={styles.noColors}>No colors available.</p>
                  )}
                </fieldset>

                <button
                  className={styles.addButton}
                  disabled={!selectedStorage || !selectedColor || isLoading}
                  onClick={addSelectedProduct}
                  type="button"
                >
                  {added ? "ADDED TO BAG" : "ADD TO CART"}
                </button>
              </div>
            </section>

            <ProductSpecifications product={product} />
            <SimilarProducts products={product.similarProducts} />
          </>
        )}
      </main>
    </div>
  );
}
