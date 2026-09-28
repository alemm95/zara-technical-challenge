"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type {
  ProductColorOption,
  ProductDetail,
  ProductStorageOption,
} from "@/types/product";
import { formatPrice } from "@/utils/money";
import styles from "./ProductDetailLayout.module.css";

export type ConfigurableProduct = Pick<
  ProductDetail,
  | "id"
  | "brand"
  | "name"
  | "basePrice"
  | "imageUrl"
  | "colorOptions"
  | "storageOptions"
>;

interface ProductConfiguratorProps {
  product: ConfigurableProduct;
}

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<ProductColorOption | null>(
    product.colorOptions[0] ?? null,
  );
  const [selectedStorage, setSelectedStorage] =
    useState<ProductStorageOption | null>(null);
  const [added, setAdded] = useState(false);

  const imageUrl = selectedColor?.imageUrl ?? product.imageUrl;
  const startingPrice =
    product.storageOptions.length > 0
      ? Math.min(...product.storageOptions.map((storage) => storage.price))
      : product.basePrice;

  function selectColor(color: ProductColorOption) {
    setSelectedColor(color);
    setAdded(false);
  }

  function selectStorage(storage: ProductStorageOption) {
    setSelectedStorage(storage);
    setAdded(false);
  }

  function addSelectedProduct() {
    if (!selectedColor || !selectedStorage) {
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
    <>
      <div className={styles.heroImage}>
        {imageUrl && (
          <Image
            alt={`${product.name}${selectedColor ? ` in ${selectedColor.name}` : ""}`}
            className={styles.productImage}
            fill
            priority
            sizes="(min-width: 1280px) 510px, (min-width: 768px) 337px, 260px"
            src={imageUrl}
          />
        )}
      </div>

      <div className={styles.configuration}>
        <h1 className={styles.productName}>{product.name}</h1>
        <p className={styles.price}>
          {selectedStorage
            ? formatPrice(selectedStorage.price)
            : `From ${formatPrice(startingPrice)}`}
        </p>

        <fieldset className={styles.optionGroup}>
          <legend>STORAGE ¿HOW MUCH SPACE DO YOU NEED?</legend>
          <div className={styles.storageOptions}>
            {product.storageOptions.map((storage) => (
              <label className={styles.storageOption} key={storage.capacity}>
                <input
                  checked={selectedStorage?.capacity === storage.capacity}
                  className={styles.optionInput}
                  name="storage"
                  onChange={() => selectStorage(storage)}
                  type="radio"
                  value={storage.capacity}
                />
                {storage.capacity}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.optionGroup}>
          <legend>COLOR. PICK YOUR FAVOURITE.</legend>
          {product.colorOptions.length > 0 ? (
            <>
              <div className={styles.colorOptions}>
                {product.colorOptions.map((color) => (
                  <label
                    className={styles.colorOption}
                    key={color.name}
                    style={{ backgroundColor: color.hexCode }}
                  >
                    <input
                      aria-label={color.name}
                      checked={selectedColor?.name === color.name}
                      className={styles.optionInput}
                      name="color"
                      onChange={() => selectColor(color)}
                      type="radio"
                      value={color.name}
                    />
                  </label>
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
          disabled={!selectedStorage || !selectedColor}
          onClick={addSelectedProduct}
          type="button"
        >
          {added ? "AÑADIDO" : "AÑADIR"}
        </button>
      </div>
    </>
  );
}
