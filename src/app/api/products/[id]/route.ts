import { getProductById } from "@/services/productService";

export const dynamic = "force-dynamic";

interface ProductRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: ProductRouteContext) {
  const { id } = await params;

  try {
    const product = await getProductById(id);
    return Response.json(product);
  } catch (error) {
    const status =
      error instanceof Error && error.message.includes("status 404")
        ? 404
        : 502;

    return Response.json(
      {
        message:
          status === 404 ? "Product not found." : "Unable to load product.",
      },
      { status },
    );
  }
}
