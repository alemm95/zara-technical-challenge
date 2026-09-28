import { getProducts } from "@/services/productService";

const DEFAULT_LIMIT = 20;

function parseNonNegativeInteger(value: string | null, fallback: number) {
  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const requestedLimit = parseNonNegativeInteger(
    searchParams.get("limit"),
    DEFAULT_LIMIT,
  );
  const limit = Math.min(requestedLimit || DEFAULT_LIMIT, DEFAULT_LIMIT);
  const offset = parseNonNegativeInteger(searchParams.get("offset"), 0);
  const search = searchParams.get("search") ?? undefined;

  try {
    const products = await getProducts({ search, limit, offset });
    return Response.json({ products, count: products.length });
  } catch {
    return Response.json(
      { message: "Unable to load the catalog." },
      { status: 502 },
    );
  }
}
