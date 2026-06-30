import { NextResponse } from "next/server";
import { fetchLiveProductPrices } from "@/lib/live-product-fetch";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = await fetchLiveProductPrices(id);

  if (!result) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
