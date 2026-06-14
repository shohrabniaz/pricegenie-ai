import { NextRequest, NextResponse } from "next/server";
import { unifiedSearch } from "@/lib/live-search";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? undefined;
  const studentMode = params.get("studentMode") === "true";

  const result = unifiedSearch(query, { category, studentMode });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
