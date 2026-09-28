import { Catalog } from "@/components/catalog/Catalog";
import { getProducts } from "@/services/productService";

export const dynamic = "force-dynamic";

export default function Home() {
  return <CatalogPage />;
}

async function CatalogPage() {
  try {
    const products = await getProducts({ limit: 20, offset: 0 });
    return <Catalog initialProducts={products} initialError={false} />;
  } catch {
    return <Catalog initialProducts={[]} initialError />;
  }
}
