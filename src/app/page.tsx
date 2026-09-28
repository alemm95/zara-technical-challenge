import { Catalog } from "@/components/catalog/Catalog";
import { getProducts } from "@/services/productService";
import {
  type CatalogSearchParam,
  normalizeCatalogSearch,
} from "@/utils/catalogSearch";

interface HomeProps {
  searchParams: Promise<{ search?: CatalogSearchParam }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const search = normalizeCatalogSearch((await searchParams).search);
  const products = await getProducts({ search, limit: 20, offset: 0 });

  return <Catalog initialProducts={products} initialSearch={search} />;
}
