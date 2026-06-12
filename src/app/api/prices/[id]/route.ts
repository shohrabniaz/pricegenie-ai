import { NextResponse } from "next/server";
import { getProductById } from "@/data/products";
import {
  fetchRemotePriceFeed,
  getProductPrices,
  mergeRemoteSnapshots,
} from "@/lib/price-feed";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const catalogProduct = getProductById(id);

  if (!catalogProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let result = getProductPrices(id, catalogProduct)!;

  const remote = await fetchRemotePriceFeed();
  if (remote) {
    result = mergeRemoteSnapshots(catalogProduct, remote);
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
