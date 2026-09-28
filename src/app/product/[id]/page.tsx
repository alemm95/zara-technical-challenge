import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail/ProductDetail";
import { ApiError } from "@/services/apiClient";
import { getProductById } from "@/services/productService";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  try {
    const product = await getProductById(id);
    return <ProductDetail initialProduct={product} productId={id} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return <ProductDetail initialError productId={id} />;
  }
}
