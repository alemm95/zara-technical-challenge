import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail/ProductDetail";
import { ApiError } from "@/services/apiClient";
import { getProductById } from "@/services/productService";
import {
  type CatalogSearchParam,
  normalizeCatalogSearch,
} from "@/utils/catalogSearch";

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: CatalogSearchParam }>;
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const search = normalizeCatalogSearch(query.search);

  try {
    const product = await getProductById(id);
    return <ProductDetail product={product} search={search} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
