import type { CartItem } from "@/types/cart";
import type { ProductDetail, ProductSummary } from "@/types/product";

export const cartItemFixture: CartItem = {
  id: "line-1",
  product: {
    id: "SMG-S24U",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1329,
    imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
  },
  color: {
    name: "Titanium Violet",
    hexCode: "#8E6F96",
    imageUrl: "https://phones.example.test/images/s24-violet.webp",
  },
  storage: { capacity: "512 GB", price: 1329 },
};

export const productListFixture: ProductSummary[] = [
  {
    id: "SMG-S24U",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1329,
    imageUrl: "https://phones.example.test/images/SMG-S24U.webp",
  },
  {
    id: "APL-I15P",
    brand: "Apple",
    name: "iPhone 15 Pro",
    basePrice: 1219,
    imageUrl: "https://phones.example.test/images/APL-I15P.webp",
  },
];

export const productDetailFixture: ProductDetail = {
  id: "SMG-S24U",
  brand: "Samsung",
  name: "Galaxy S24 Ultra",
  basePrice: 1329,
  description: "A flagship phone.",
  rating: 4.6,
  specs: {
    screen: "6.8 inch AMOLED",
    resolution: "3120 x 1440",
    processor: "Snapdragon 8 Gen 3",
    mainCamera: "200 MP",
    selfieCamera: "12 MP",
    battery: "5000 mAh",
    os: "Android 14",
    screenRefreshRate: "120 Hz",
  },
  colorOptions: [
    {
      name: "Titanium Violet",
      hexCode: "#8E6F96",
      imageUrl: "https://phones.example.test/images/s24-violet.webp",
    },
    {
      name: "Titanium Black",
      hexCode: "#000000",
      imageUrl: "https://phones.example.test/images/s24-black.webp",
    },
  ],
  storageOptions: [
    { capacity: "256 GB", price: 1229 },
    { capacity: "512 GB", price: 1329 },
    { capacity: "1 TB", price: 1529 },
  ],
  similarProducts: [
    {
      id: "SMG-A25",
      brand: "Samsung",
      name: "Galaxy A25 5G",
      basePrice: 239,
      imageUrl: "https://phones.example.test/images/a25.webp",
    },
  ],
};
