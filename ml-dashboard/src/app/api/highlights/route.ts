import { NextRequest, NextResponse } from "next/server";
import { getHighlights } from "@/lib/mercadolibre";

export const revalidate = 300; // 5 min

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("category");
  const siteId = req.nextUrl.searchParams.get("site") ?? undefined;

  if (!categoryId) {
    return NextResponse.json({ error: "Missing category parameter" }, { status: 400 });
  }

  try {
    const data = await getHighlights(categoryId, siteId);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
