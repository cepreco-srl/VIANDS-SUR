import { NextRequest, NextResponse } from "next/server";
import { getTrends } from "@/lib/mercadolibre";

export const revalidate = 300; // 5 min

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("site") ?? undefined;
  try {
    const data = await getTrends(siteId);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
