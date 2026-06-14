import { NextResponse } from "next/server";
import { isSupportedProductUrl } from "@/lib/retailer-detect";
import { analyzeProductUrl } from "@/lib/url-analyzer";

export async function POST(request: Request) {
  let body: { url?: string; studentMode?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!isSupportedProductUrl(url)) {
    return NextResponse.json(
      {
        error:
          "Unsupported retailer. Paste a product URL from Amazon AU, eBay AU, JB Hi-Fi, Harvey Norman, The Good Guys, Officeworks, Kogan, Big W, or Kmart.",
      },
      { status: 400 }
    );
  }

  const studentMode = Boolean(body.studentMode);
  const result = await analyzeProductUrl(url, studentMode);

  return NextResponse.json(result);
}
