export interface ProductSummary {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  imageUrl: string;
}

export interface ProductSpecs {
  screen: string;
  resolution: string;
  processor: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  os: string;
  screenRefreshRate: string;
}

export interface ProductColorOption {
  name: string;
  hexCode: string;
  imageUrl: string;
}

export interface ProductStorageOption {
  capacity: string;
  price: number;
}

export interface ProductDetail extends Omit<ProductSummary, "imageUrl"> {
  imageUrl?: string;
  description: string;
  rating: number;
  specs: ProductSpecs;
  colorOptions: ProductColorOption[];
  storageOptions: ProductStorageOption[];
  similarProducts: ProductSummary[];
}
