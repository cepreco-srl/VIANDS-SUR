import { NextRequest, NextResponse } from "next/server";
import { getRootCategories } from "@/lib/mercadolibre";

export const revalidate = 3600; // 1 hour

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("site") ?? undefined;
  try {
    const data = await getRootCategories(siteId);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
